import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";

const fetchTypedFromServiceControl = vi.fn();
const authFetch = vi.fn();

vi.mock("@/components/serviceControlClient", () => ({
  default: {
    url: "http://localhost:33333/api/",
    fetchTypedFromServiceControl: (...args: unknown[]) => fetchTypedFromServiceControl(...args),
  },
}));

vi.mock("@/components/monitoring/monitoringClient", () => ({
  default: {
    url: "http://localhost:33633/",
    isMonitoringEnabled: true,
  },
}));

vi.mock("@/composables/useAuthenticatedFetch", () => ({
  authFetch: (...args: unknown[]) => authFetch(...args),
}));

describe("PlatformModelStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    fetchTypedFromServiceControl.mockReset();
    authFetch.mockReset();
    window.__platformHealth = undefined;
  });

  test("keeps monitoring in the shared model for multi-region", async () => {
    fetchTypedFromServiceControl
      .mockResolvedValueOnce([
        { headers: new Headers() },
        {
          name: "Particular.ServiceControl.CrossRegion",
          platform_health_mode: "multi-region",
          platform_health_status: "healthy",
          platform_health_version: "6.19.3",
          platform_health_warnings: [],
        },
      ])
      .mockResolvedValueOnce([
        { headers: new Headers() },
        [
          {
            api_uri: "http://Particular.ServiceControl.RegionA/api/",
            version: "6.19.3",
            status: "online",
            configuration: { data_retention: { error_retention_period: "14.00:00:00" } },
          },
        ],
      ]);
    authFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ platform_health_status: "healthy", platform_health_version: "6.19.3", Metrics: {} }),
    } as Response);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.isMultiRegion).toBe(true);
    expect(store.monitoring).not.toBeNull();
    expect(store.monitoring?.role).toBe("monitoring");
    expect(store.errorInstances).toHaveLength(1);
  });
});
