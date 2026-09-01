import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const auditClient = vi.hoisted(() => ({ hasSuccessfulMessages: vi.fn() }));
vi.mock("@/components/audit/auditClient", () => ({ default: auditClient }));
vi.mock("@/components/monitoring/monitoringClient", () => ({ default: { isMonitoringEnabled: false } }));
vi.mock("@/components/serviceControlClient", () => ({ default: { url: undefined } }));
vi.mock("@/composables/useConnectionsAndStatsAutoRefresh", () => ({
  default: () => ({ store: { monitoringConnectionState: { unableToConnect: true } } }),
}));

import { usePlatformCapabilitiesStore } from "@/stores/PlatformCapabilitiesStore";

describe("FEATURE: Successful-messages capability probe", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("EXAMPLE: Before the first probe answers, the state is unknown, not 'no messages'", () => {
    const store = usePlatformCapabilitiesStore();

    expect(store.hasSuccessfulMessages).toBeNull();
  });

  test("EXAMPLE: A failed probe proves nothing — the state stays unknown and is retried", async () => {
    auditClient.hasSuccessfulMessages.mockRejectedValue(new Error("boom"));
    const store = usePlatformCapabilitiesStore();

    await store.refresh();
    expect(store.hasSuccessfulMessages).toBeNull();

    auditClient.hasSuccessfulMessages.mockReset();
    auditClient.hasSuccessfulMessages.mockResolvedValue(true);
    await store.refresh();
    expect(store.hasSuccessfulMessages).toBe(true);
  });

  test("EXAMPLE: A completed probe finding nothing reports false", async () => {
    auditClient.hasSuccessfulMessages.mockResolvedValue(false);
    const store = usePlatformCapabilitiesStore();

    await store.refresh();

    expect(store.hasSuccessfulMessages).toBe(false);
  });

  test("EXAMPLE: A bounded window is probed before falling back to the full store", async () => {
    auditClient.hasSuccessfulMessages.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const store = usePlatformCapabilitiesStore();

    await store.refresh();

    expect(auditClient.hasSuccessfulMessages).toHaveBeenCalledTimes(2);
    expect(auditClient.hasSuccessfulMessages.mock.calls[0][0]).toBeInstanceOf(Date); // bounded first
    expect(auditClient.hasSuccessfulMessages.mock.calls[1][0]).toBeUndefined(); // unbounded fallback
    expect(store.hasSuccessfulMessages).toBe(true);
  });

  test("EXAMPLE: A hit in the bounded window skips the expensive unbounded probe", async () => {
    auditClient.hasSuccessfulMessages.mockResolvedValueOnce(true);
    const store = usePlatformCapabilitiesStore();

    await store.refresh();

    expect(auditClient.hasSuccessfulMessages).toHaveBeenCalledTimes(1);
    expect(store.hasSuccessfulMessages).toBe(true);
  });

  test("EXAMPLE: Once successful messages were seen, later refreshes stop probing", async () => {
    auditClient.hasSuccessfulMessages.mockResolvedValue(true);
    const store = usePlatformCapabilitiesStore();

    await store.refresh();
    await store.refresh();
    await store.refresh();

    expect(auditClient.hasSuccessfulMessages).toHaveBeenCalledTimes(1);
  });
});
