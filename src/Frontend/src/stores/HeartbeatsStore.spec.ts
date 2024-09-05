import { describe, expect, test } from "vitest";
import { Driver } from "../../test/driver";
import { makeDriverForTests } from "@component-test-utils";
import { storeToRefs } from "pinia";
import { createTestingPinia } from "@pinia/testing";
import { EndpointsView } from "@/resources/EndpointView";
import { useServiceControlUrls } from "@/composables/serviceServiceControlUrls";
import { useServiceControl } from "@/composables/serviceServiceControl";
import * as precondition from "../../test/preconditions";
import { EndpointSettings } from "@/resources/EndpointSettings";
import { serviceControlWithHeartbeats } from "@/components/heartbeats/serviceControlWithHeartbeats";
import flushPromises from "flush-promises";
import { EndpointStatus } from "@/resources/Heartbeat";
import { ColumnNames, useHeartbeatsStore } from "@/stores/HeartbeatsStore";

describe("HeartbeatsStore tests", () => {
  async function setup(endpoints: EndpointsView[], endpointSettings: EndpointSettings[], preSetup: (driver: Driver) => Promise<void> = () => Promise.resolve()) {
    const driver = makeDriverForTests();

    await preSetup(driver);
    await driver.setUp(serviceControlWithHeartbeats);
    await driver.setUp(precondition.hasEndpointSettings(endpointSettings));
    await driver.setUp(precondition.hasHeartbeatsEndpoints(endpoints));

    useServiceControlUrls();
    await useServiceControl();

    const store = useHeartbeatsStore(createTestingPinia({ stubActions: false }));
    const storeRefs = storeToRefs(store);

    await flushPromises();

    return { driver, ...store, ...storeRefs };
  }

  test("no endpoints", async () => {
    const { filteredHealthyEndpoints, filteredUnhealthyEndpoints } = await setup([], []);

    expect(filteredHealthyEndpoints.value.length).toBe(0);
    expect(filteredUnhealthyEndpoints.value.length).toBe(0);
  });

  describe("healthy endpoints", () => {
    test("filter by name", async () => {
      const defaultEndpointsView = <EndpointsView>{ is_sending_heartbeats: true, id: "", name: "", monitor_heartbeat: true, host_display_name: "", heartbeat_information: { reported_status: EndpointStatus.Alive, last_report_at: "" } };
      const { filteredHealthyEndpoints, endpointFilterString } = await setup(
        [
          { ...defaultEndpointsView, ...(<Partial<EndpointsView>>{ name: "John" }) },
          { ...defaultEndpointsView, ...(<Partial<EndpointsView>>{ name: "johnny" }) },
          { ...defaultEndpointsView, ...(<Partial<EndpointsView>>{ name: "Oliver" }) },
        ],
        [{ name: "", track_instances: true }]
      );

      expect(filteredHealthyEndpoints.value.length).toBe(3);
      endpointFilterString.value = "John";
      expect(filteredHealthyEndpoints.value.length).toBe(2);
      endpointFilterString.value = "Oliver";
      expect(filteredHealthyEndpoints.value.length).toBe(1);
    });

    test("sort by", async () => {
      const defaultEndpointsView = <EndpointsView>{ is_sending_heartbeats: true, id: "", name: "", monitor_heartbeat: true, host_display_name: "", heartbeat_information: { reported_status: EndpointStatus.Alive, last_report_at: "" } };
      const { filteredHealthyEndpoints, sortByInstances } = await setup(
        [
          { ...defaultEndpointsView, ...(<Partial<EndpointsView>>{ name: "John", heartbeat_information: { reported_status: EndpointStatus.Alive, last_report_at: "2024-10-01T00:00:00" }, monitor_heartbeat: true }) },
          { ...defaultEndpointsView, ...(<Partial<EndpointsView>>{ name: "John", heartbeat_information: { reported_status: EndpointStatus.Alive, last_report_at: "2024-10-01T00:00:00" }, monitor_heartbeat: false }) },
          { ...defaultEndpointsView, ...(<Partial<EndpointsView>>{ name: "Anna", heartbeat_information: { reported_status: EndpointStatus.Alive, last_report_at: "2024-01-01T00:00:00" } }) },
          { ...defaultEndpointsView, ...(<Partial<EndpointsView>>{ name: "Anna", heartbeat_information: { reported_status: EndpointStatus.Alive, last_report_at: "2024-01-01T00:00:00" } }) },
          { ...defaultEndpointsView, ...(<Partial<EndpointsView>>{ name: "Anna", heartbeat_information: { reported_status: EndpointStatus.Alive, last_report_at: "2024-01-01T00:00:00" } }) },
          { ...defaultEndpointsView, ...(<Partial<EndpointsView>>{ name: "Oliver", heartbeat_information: { reported_status: EndpointStatus.Alive, last_report_at: "2024-06-01T00:00:00" } }) },
        ],
        [
          { name: "", track_instances: true },
          { name: "John", track_instances: false },
        ]
      );

      const names = () => filteredHealthyEndpoints.value.map((value) => value.name);

      sortByInstances.value = { property: ColumnNames.Name, isAscending: true };
      expect(names()).toEqual(["Anna", "John", "Oliver"]);

      sortByInstances.value = { property: ColumnNames.Name, isAscending: false };
      expect(names()).toEqual(["Oliver", "John", "Anna"]);

      sortByInstances.value = { property: ColumnNames.LastHeartbeat, isAscending: true };
      expect(names()).toEqual(["Anna", "Oliver", "John"]);

      sortByInstances.value = { property: ColumnNames.LastHeartbeat, isAscending: false };
      expect(names()).toEqual(["John", "Oliver", "Anna"]);

      sortByInstances.value = { property: ColumnNames.Muted, isAscending: true };
      expect(names()[2]).toBe("John");

      sortByInstances.value = { property: ColumnNames.Muted, isAscending: false };
      expect(names()[0]).toBe("John");

      sortByInstances.value = { property: ColumnNames.Tracked, isAscending: true };
      expect(names()[0]).toBe("John");

      sortByInstances.value = { property: ColumnNames.Tracked, isAscending: false };
      expect(names()[2]).toBe("John");

      sortByInstances.value = { property: ColumnNames.InstancesTotal, isAscending: true };
      expect(names()[2]).toBe("Anna");

      sortByInstances.value = { property: ColumnNames.InstancesTotal, isAscending: false };
      expect(names()[0]).toBe("Anna");
    });
  });
});
