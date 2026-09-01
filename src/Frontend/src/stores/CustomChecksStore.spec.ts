import { beforeEach, describe, expect, test } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { Status } from "@/resources/CustomCheck";
import { useCustomChecksStore } from "@/stores/CustomChecksStore";

describe("CustomChecksStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("hides internal platform custom checks by default", () => {
    const store = useCustomChecksStore();

    store.replaceFailedChecks([createCheck("ServiceControl Primary Instance", "Health", true), createCheck("SampleCustomeCheck 1", "Some Category 1")]);

    expect(store.rawFailingCount).toBe(2);
    expect(store.failedChecks).toHaveLength(1);
    expect(store.failingCount).toBe(1);
    expect(store.failedChecks[0].custom_check_id).toBe("SampleCustomeCheck 1");
  });

  test("shows internal platform custom checks when toggled on", () => {
    const store = useCustomChecksStore();

    store.replaceFailedChecks([createCheck("ServiceControl Primary Instance", "Health", true), createCheck("SampleCustomeCheck 1", "Some Category 1")]);
    store.showPlatformCustomChecks = true;

    expect(store.failedChecks).toHaveLength(2);
    expect(store.failingCount).toBe(2);
  });
});

function createCheck(custom_check_id: string, category: string, internal = false) {
  return {
    id: `customchecks/${custom_check_id}`,
    custom_check_id,
    category,
    status: Status.Fail,
    reported_at: "2025-01-10T05:06:30.4074087Z",
    failure_reason: "Failure",
    internal,
    originating_endpoint: {
      name: "EndpointX",
      host_id: "host-id",
      host: "HostX",
    },
  };
}
