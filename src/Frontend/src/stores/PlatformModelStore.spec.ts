import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";

const getRoot = vi.fn();
const getRemoteInstances = vi.fn();
const getMonitoringRoot = vi.fn();

vi.mock("@/components/serviceControlClient", () => ({
  default: {
    url: "http://localhost:33333/api/",
    getRoot: () => getRoot(),
    getRemoteInstances: (...args: unknown[]) => getRemoteInstances(...args),
  },
}));

vi.mock("@/components/monitoring/monitoringClient", () => ({
  default: {
    url: "http://localhost:33633/",
    isMonitoringEnabled: true,
    getMonitoringRoot: (...args: unknown[]) => getMonitoringRoot(...args),
  },
}));

describe("PlatformModelStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    getRoot.mockReset();
    getRemoteInstances.mockReset();
    getMonitoringRoot.mockReset();
    window.__platformHealth = undefined;
  });

  test("keeps monitoring in the shared model for multi-region", async () => {
    getRoot.mockResolvedValue({
      name: "Particular.ServiceControl.CrossRegion",
      platform_health_status: "healthy",
      platform_health_version: "6.19.3",
      platform_health_warnings: [],
    });
    getRemoteInstances.mockResolvedValue([
      {
        api_uri: "http://Particular.ServiceControl.RegionA/api/",
        version: "6.19.3",
        status: "online",
        configuration: { data_retention: { error_retention_period: "14.00:00:00" } },
      },
    ]);
    getMonitoringRoot.mockResolvedValue({ platform_health_status: "healthy", platform_health_version: "6.19.3" });

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.isMultiRegion).toBe(true);
    expect(store.monitoring).not.toBeNull();
    expect(store.monitoring?.role).toBe("monitoring");
    expect(store.primary?.role).toBe("primary-error");
    expect(store.errorInstances).toHaveLength(1);
  });
});
