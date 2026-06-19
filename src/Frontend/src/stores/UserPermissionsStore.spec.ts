import { describe, test, expect, beforeEach, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";

vi.mock("@/components/serviceControlClient", () => ({
  default: { fetchTypedFromUrl: vi.fn() },
}));

import serviceControlClient from "@/components/serviceControlClient";
import logger from "@/logger";
import { useUserPermissionsStore } from "@/stores/UserPermissionsStore";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";

const summaryUrl = "http://localhost/my/permissions";
const allUrl = "http://localhost/my/permissions/all";

const fetchTypedFromUrl = vi.mocked(serviceControlClient.fetchTypedFromUrl);

const summaryData = { failed_messages_read: true, failed_messages_write: false, auditing_read: true, monitoring_read: false, monitoring_write: false, admin_read: false, admin_write: false };
const descriptorData = { user: "alice", permissions: ["error:messages:view", "audit:view"] };

function ok<T>(data: T): [Response, T] {
  return [{} as Response, data];
}

function setup() {
  setActivePinia(createTestingPinia({ stubActions: false }));
  const environment = useEnvironmentAndVersionsStore().environment;
  environment.mypermissions_summary_url = summaryUrl;
  environment.mypermissions_all_url = allUrl;
  return useUserPermissionsStore();
}

describe("UserPermissionsStore", () => {
  beforeEach(() => {
    fetchTypedFromUrl.mockReset();
  });

  test("refresh fetches the discovered URLs and populates summary and descriptor", async () => {
    const store = setup();
    fetchTypedFromUrl.mockImplementation((url: string) => Promise.resolve(url === summaryUrl ? ok(summaryData) : ok(descriptorData)));

    await store.refresh();

    expect(fetchTypedFromUrl).toHaveBeenCalledWith(summaryUrl);
    expect(fetchTypedFromUrl).toHaveBeenCalledWith(allUrl);
    expect(store.summary).toEqual(summaryData);
    expect(store.descriptor).toEqual(descriptorData);
    expect(store.error).toBeNull();
    expect(store.loading).toBe(false);
  });

  test("refresh records an error and logs when a request fails", async () => {
    const store = setup();
    const loggerError = vi.spyOn(logger, "error").mockImplementation(() => {});
    const failure = new Error("boom");
    fetchTypedFromUrl.mockRejectedValue(failure);

    await store.refresh();

    expect(store.summary).toBeNull();
    expect(store.error).toBe("Failed to load user permissions");
    expect(store.loading).toBe(false);
    expect(loggerError).toHaveBeenCalledWith("Failed to load user permissions", failure);
    loggerError.mockRestore();
  });

  test("concurrent refreshes share a single in-flight request", async () => {
    const store = setup();
    let resolveSummary: (value: [Response, typeof summaryData]) => void = () => {};
    const pendingSummary = new Promise<[Response, typeof summaryData]>((resolve) => (resolveSummary = resolve));
    fetchTypedFromUrl.mockImplementation((url: string) => (url === summaryUrl ? pendingSummary : Promise.resolve(ok(descriptorData))));

    const first = store.refresh();
    const second = store.refresh();

    // One load in flight => two endpoint calls (summary + descriptor), not four.
    expect(fetchTypedFromUrl).toHaveBeenCalledTimes(2);

    resolveSummary(ok(summaryData));
    await Promise.all([first, second]);

    expect(store.summary).toEqual(summaryData);

    // Once settled the in-flight slot is released, so a later refresh fetches again.
    await store.refresh();
    expect(fetchTypedFromUrl).toHaveBeenCalledTimes(4);
  });
});
