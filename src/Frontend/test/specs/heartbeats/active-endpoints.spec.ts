import { expect, vi } from "vitest";
import { waitFor } from "@testing-library/vue";
import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { healthyEndpointTemplate, unHealthyEndpointTemplate } from "../../mocks/heartbeat-endpoint-template";
import { getHeartbeatsTabCount } from "./questions/getHeartbeatsTabCount";
import { getListedEndpointNames } from "./questions/getListedEndpointNames";
import { getEndpointInstanceRows } from "./questions/getEndpointInstanceRows";
import { getAllHeartbeatEndpointRecords, getHeartbeatEndpointRecord } from "./questions/getHeartbeatEndpointRecord";
import { getColumnSortDirection } from "./questions/getColumnSortDirection";
import { navigateToEndpointInstances, navigateBackToEndpointList } from "./actions/navigateToEndpointInstances";
import { sortEndpointsBy } from "./actions/sortEndpointsBy";
import { setHeartbeatFilter } from "./actions/setHeartbeatFilter";

vi.mock("@vueuse/core", async (importOriginal) => {
  const originalModule = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...originalModule,
    useDebounceFn: (fn: Function) => fn,
  };
});

const receivedHeartbeat = expect.stringMatching(/ago$/);

describe("FEATURE: Active Endpoints", () => {
  describe("RULE: The number of active endpoints should be shown", () => {
    test("EXAMPLE: With 7 active endpoints, the tab should show (7)", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasHealthyEndpoints(7));

      await driver.goTo("heartbeats/healthy");

      await waitFor(() => expect(getHeartbeatsTabCount("active")).toBe(7));
    });

    test("EXAMPLE: With 7 active endpoints and 1 endpoint stop sending heartbeat, the tab should show (6)", async ({ driver }) => {
      vi.useFakeTimers();

      try {
        const endpoints = precondition.heartbeatEndpointNames("ActiveEndpoint", 7);
        const stoppedEndpoint = endpoints[endpoints.length - 1];
        const stillSending = endpoints.filter((name) => name !== stoppedEndpoint);

        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.endpointsWithHeartbeatStatus(endpoints));

        await driver.goTo("heartbeats/healthy");
        await waitFor(() => expect(getHeartbeatsTabCount("active")).toBe(7));

        await driver.setUp(precondition.endpointsWithHeartbeatStatus(stillSending, [stoppedEndpoint]));
        vi.advanceTimersByTime(5000);

        await waitFor(() => expect(getHeartbeatsTabCount("active")).toBe(6));
      } finally {
        vi.useRealTimers();
      }
    });

    test("EXAMPLE: With 6 active endpoints and 1 endpoint starts sending heartbeat, the tab should show (7)", async ({ driver }) => {
      vi.useFakeTimers();

      try {
        const endpoints = precondition.heartbeatEndpointNames("RevivingEndpoint", 7);
        const startingEndpoint = endpoints[endpoints.length - 1];
        const alreadySending = endpoints.filter((name) => name !== startingEndpoint);

        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.endpointsWithHeartbeatStatus(alreadySending, [startingEndpoint]));

        await driver.goTo("heartbeats/healthy");
        await waitFor(() => expect(getHeartbeatsTabCount("active")).toBe(6));

        await driver.setUp(precondition.endpointsWithHeartbeatStatus([...alreadySending, startingEndpoint]));
        vi.advanceTimersByTime(5000);

        await waitFor(() => expect(getHeartbeatsTabCount("active")).toBe(7));
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("RULE: A list of active endpoints should be shown", () => {
    test("EXAMPLE: With 3 active endpoints sending heartbeats, 3 endpoints should be shown in the list of active endpoints", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasHealthyEndpoints(3));

      await driver.goTo("heartbeats/healthy");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["HealthyHeartbeatEndpoint_0", "HealthyHeartbeatEndpoint_1", "HealthyHeartbeatEndpoint_2"]));
    });
  });

  describe("RULE: Active endpoint list row should show endpoint instances with name, host identifier, and latest heartbeat received", () => {
    test("EXAMPLE: With 3 active endpoint instances named 'Endpoint1' at host 'HOST1' sending a heartbeat, there should be 3 rows displaying 'Endpoint1@HOST1', and the latest heartbeat received", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.hasHeartbeatsEndpoints(
          [1, 2, 3].map((instance) => ({
            ...healthyEndpointTemplate,
            id: `Endpoint1_instance${instance}`,
            name: "Endpoint1",
            host_display_name: "HOST1",
          }))
        )
      );

      await driver.goTo("heartbeats/healthy");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Endpoint1"]));

      const logicalEndpoint = await getHeartbeatEndpointRecord("Endpoint1");

      expect(logicalEndpoint?.instanceCount).toBe("3/3");
      expect(logicalEndpoint?.lastHeartbeat).toEqual(receivedHeartbeat);

      await navigateToEndpointInstances("Endpoint1");

      expect(getEndpointInstanceRows()).toEqual([
        { hostName: "HOST1", lastHeartbeat: receivedHeartbeat },
        { hostName: "HOST1", lastHeartbeat: receivedHeartbeat },
        { hostName: "HOST1", lastHeartbeat: receivedHeartbeat },
      ]);
    });
  });

  describe("RULE: Active endpoint list row should show logical endpoint with name, number of instances, host identifier, and latest heartbeat received", () => {
    test("EXAMPLE: With multiple instances of an endpoints sending heartbeats, only the single logical endpoint details should be displayed in the list", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.hasHeartbeatsEndpoints([
          { ...healthyEndpointTemplate, id: "Endpoint1_HOST1", name: "Endpoint1", host_display_name: "HOST1" },
          { ...healthyEndpointTemplate, id: "Endpoint1_HOST2", name: "Endpoint1", host_display_name: "HOST2" },
          { ...healthyEndpointTemplate, id: "Endpoint2_HOST1", name: "Endpoint2", host_display_name: "HOST1" },
        ])
      );

      await driver.goTo("heartbeats/healthy");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Endpoint1", "Endpoint2"]));

      const records = await getAllHeartbeatEndpointRecords();

      expect(records.map(({ name, instanceCount }) => ({ name, instanceCount }))).toEqual([
        { name: "Endpoint1", instanceCount: "2/2" },
        { name: "Endpoint2", instanceCount: "1/1" },
      ]);
      expect(records.map(({ lastHeartbeat }) => lastHeartbeat)).toEqual([receivedHeartbeat, receivedHeartbeat]);
    });
  });

  describe("RULE: Changing between logical and instance listing displays should be possible", () => {
    test("EXAMPLE: Opening a logical endpoint from the active list shows its instances, and going back returns to the active list", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.hasHeartbeatsEndpoints([
          { ...healthyEndpointTemplate, id: "Endpoint1_HOST1", name: "Endpoint1", host_display_name: "HOST1" },
          { ...healthyEndpointTemplate, id: "Endpoint1_HOST2", name: "Endpoint1", host_display_name: "HOST2" },
        ])
      );

      await driver.goTo("heartbeats/healthy");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Endpoint1"]));

      await navigateToEndpointInstances("Endpoint1");
      expect(getEndpointInstanceRows().map((row) => row.hostName)).toEqual(["HOST1", "HOST2"]);

      await navigateBackToEndpointList("active");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Endpoint1"]));
    });
  });

  describe("RULE: Sorting by of the name of an endpoint should be possible in all displays", () => {
    test("EXAMPLE: Active endpoints are listed by name ascending by default and can be sorted descending", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.endpointsWithHeartbeatStatus(["Foo1", "Foo2", "Foo3"]));

      await driver.goTo("heartbeats/healthy");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Foo1", "Foo2", "Foo3"]));
      expect(getColumnSortDirection("name")).toBe("ascending");

      await sortEndpointsBy("name");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Foo3", "Foo2", "Foo1"]));
      expect(getColumnSortDirection("name")).toBe("descending");
    });

    test("EXAMPLE: Endpoint instances are listed by host name ascending by default and can be sorted descending", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.hasHeartbeatsEndpoints([
          { ...healthyEndpointTemplate, id: "Endpoint1_HOST1", name: "Endpoint1", host_display_name: "HOST1" },
          { ...healthyEndpointTemplate, id: "Endpoint1_HOST2", name: "Endpoint1", host_display_name: "HOST2" },
          { ...healthyEndpointTemplate, id: "Endpoint1_HOST3", name: "Endpoint1", host_display_name: "HOST3" },
        ])
      );

      await driver.goTo("heartbeats/instances/Endpoint1");

      await waitFor(() => expect(getEndpointInstanceRows().map((row) => row.hostName)).toEqual(["HOST1", "HOST2", "HOST3"]));
      expect(getColumnSortDirection("name")).toBe("ascending");

      await sortEndpointsBy("name");

      await waitFor(() => expect(getEndpointInstanceRows().map((row) => row.hostName)).toEqual(["HOST3", "HOST2", "HOST1"]));
      expect(getColumnSortDirection("name")).toBe("descending");
    });
  });

  describe("RULE: Filtering endpoints by name should be possible", () => {
    test("EXAMPLE: Filtering the active endpoints list shows only the endpoints whose name matches", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.endpointsWithHeartbeatStatus(["Foo1", "Bar", "Foo2"]));

      await driver.goTo("heartbeats/healthy");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Bar", "Foo1", "Foo2"]));

      await setHeartbeatFilter("Foo");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Foo1", "Foo2"]));
    });
  });
});

describe("FEATURE: Inactive endpoints", () => {
  describe("RULE: The count of inactive endpoints should be displayed", () => {
    test("EXAMPLE: With 3 inactive endpoints, the tab should show (3)", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.endpointsWithHeartbeatStatus([], ["Down1", "Down2", "Down3"]));

      await driver.goTo("heartbeats/unhealthy");

      await waitFor(() => expect(getHeartbeatsTabCount("inactive")).toBe(3));
    });

    test("EXAMPLE: With 3 inactive endpoints and 1 endpoint starts sending heartbeats, the tab should show (2)", async ({ driver }) => {
      vi.useFakeTimers();

      try {
        const recoveringEndpoint = "RecoveringEndpoint";
        const stillDown = ["Down1", "Down2"];

        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.endpointsWithHeartbeatStatus([], [recoveringEndpoint, ...stillDown]));

        await driver.goTo("heartbeats/unhealthy");
        await waitFor(() => expect(getHeartbeatsTabCount("inactive")).toBe(3));

        await driver.setUp(precondition.endpointsWithHeartbeatStatus([recoveringEndpoint], stillDown));
        vi.advanceTimersByTime(5000);

        await waitFor(() => expect(getHeartbeatsTabCount("inactive")).toBe(2));
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("RULE: Listing inactive endpoints should be possible", () => {
    test("EXAMPLE: With 3 inactive endpoints, 3 endpoints should be shown in the list of inactive endpoints", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.endpointsWithHeartbeatStatus([], ["Down1", "Down2", "Down3"]));

      await driver.goTo("heartbeats/unhealthy");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Down1", "Down2", "Down3"]));
    });
  });

  describe("RULE: Changing between logical and instance listing displays should be possible", () => {
    test("EXAMPLE: Opening a logical endpoint from the inactive list shows its instances, and going back returns to the inactive list", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.hasHeartbeatsEndpoints([
          { ...unHealthyEndpointTemplate, id: "EndpointDown_HOST1", name: "EndpointDown", host_display_name: "HOST1" },
          { ...unHealthyEndpointTemplate, id: "EndpointDown_HOST2", name: "EndpointDown", host_display_name: "HOST2" },
        ])
      );

      await driver.goTo("heartbeats/unhealthy");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["EndpointDown"]));

      await navigateToEndpointInstances("EndpointDown");
      expect(getEndpointInstanceRows().map((row) => row.hostName)).toEqual(["HOST1", "HOST2"]);

      await navigateBackToEndpointList("inactive");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["EndpointDown"]));
    });
  });

  describe("RULE: Sorting by of the name of an endpoint should be possible in all displays", () => {
    test("EXAMPLE: Inactive endpoints are listed by name ascending by default and can be sorted descending", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.endpointsWithHeartbeatStatus([], ["Foo1", "Foo2", "Foo3"]));

      await driver.goTo("heartbeats/unhealthy");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Foo1", "Foo2", "Foo3"]));
      expect(getColumnSortDirection("name")).toBe("ascending");

      await sortEndpointsBy("name");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Foo3", "Foo2", "Foo1"]));
      expect(getColumnSortDirection("name")).toBe("descending");
    });

    test("EXAMPLE: Instances of an inactive endpoint are listed by host name ascending by default and can be sorted descending", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.hasHeartbeatsEndpoints([
          { ...unHealthyEndpointTemplate, id: "EndpointDown_HOST1", name: "EndpointDown", host_display_name: "HOST1" },
          { ...unHealthyEndpointTemplate, id: "EndpointDown_HOST2", name: "EndpointDown", host_display_name: "HOST2" },
          { ...unHealthyEndpointTemplate, id: "EndpointDown_HOST3", name: "EndpointDown", host_display_name: "HOST3" },
        ])
      );

      await driver.goTo("heartbeats/instances/EndpointDown");

      await waitFor(() => expect(getEndpointInstanceRows().map((row) => row.hostName)).toEqual(["HOST1", "HOST2", "HOST3"]));
      expect(getColumnSortDirection("name")).toBe("ascending");

      await sortEndpointsBy("name");

      await waitFor(() => expect(getEndpointInstanceRows().map((row) => row.hostName)).toEqual(["HOST3", "HOST2", "HOST1"]));
      expect(getColumnSortDirection("name")).toBe("descending");
    });
  });

  describe("RULE: Filtering endpoints by name should be possible", () => {
    test("EXAMPLE: Filtering the inactive endpoints list shows only the endpoints whose name matches", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.endpointsWithHeartbeatStatus([], ["Foo1", "Bar", "Foo2"]));

      await driver.goTo("heartbeats/unhealthy");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Bar", "Foo1", "Foo2"]));

      await setHeartbeatFilter("Foo");

      await waitFor(() => expect(getListedEndpointNames()).toEqual(["Foo1", "Foo2"]));
    });
  });
});
