import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";
import { RemoteInstanceType } from "@/resources/RemoteInstance";

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

  test("prefers remote configuration host.instance_name over api hostname", async () => {
    getRoot.mockResolvedValue({
      name: "Particular.ServiceControl.Primary",
      platform_health_status: "healthy",
      platform_health_version: "6.19.3",
    });
    getRemoteInstances.mockResolvedValue([
      {
        api_uri: "http://localhost:33334/api/",
        version: "6.19.3",
        status: "online",
        configuration: {
          host: { instance_name: "Particular.ServiceControl.Audit.Blue" },
          data_retention: { audit_retention_period: "7.00:00:00" },
        },
      },
    ]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.remotes[0].name).toBe("Particular.ServiceControl.Audit.Blue");
  });

  test("uses primary root values directly when the request succeeds", async () => {
    getRoot.mockResolvedValue({
      name: "Particular.ServiceControl.Primary",
      platform_health_status: "degraded",
      platform_health_version: "6.18.1",
    });
    getRemoteInstances.mockResolvedValue([]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.primary?.name).toBe("Particular.ServiceControl.Primary");
    expect(store.primary?.health).toBe("degraded");
    expect(store.primary?.version).toBe("6.18.1");
  });

  test("uses cached remote instance type when an unavailable remote no longer has configuration", async () => {
    getRoot.mockResolvedValue({
      name: "Particular.ServiceControl.Primary",
      platform_health_status: "healthy",
      platform_health_version: "6.19.3",
    });
    getRemoteInstances.mockResolvedValue([
      {
        api_uri: "http://localhost:33334/api/",
        version: "6.19.3",
        status: "unavailable",
        cachedInstanceType: RemoteInstanceType.Error,
      },
    ]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.remotes[0].kind).toBe("error");
    expect(store.remotes[0].role).toBe("remote-error");
    expect(store.isMultiRegion).toBe(true);
  });
});
