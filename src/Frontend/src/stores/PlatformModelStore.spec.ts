import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";
import { RemoteInstanceType } from "@/resources/RemoteInstance";

const getRoot = vi.fn();
const getRemoteInstances = vi.fn();
const getMonitoringRoot = vi.fn();
const getConfiguration = vi.fn();

vi.mock("@/components/serviceControlClient", () => ({
  default: {
    url: "http://localhost:33333/api/",
    getRoot: (...args: unknown[]) => getRoot(...args),
    getRemoteInstances: (...args: unknown[]) => getRemoteInstances(...args),
    fetchFromServiceControl: (...args: unknown[]) => getConfiguration(...args),
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
    getConfiguration.mockReset();
    window.__platformHealth = undefined;
  });

  test("keeps monitoring in the shared model when remote error instances exist", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "Particular.ServiceControl.CrossRegion", health: "healthy", version: "6.19.3" }));
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

    expect(store.servicePulse).not.toBeNull();
    expect(store.servicePulse?.name).toBe("ServicePulse");
    expect(store.servicePulse?.health).toBe("healthy");
    expect(store.monitoring).not.toBeNull();
    expect(store.monitoring?.role).toBe("monitoring");
    expect(store.primary?.role).toBe("primary-error");
    expect(store.errorInstances).toHaveLength(1);
  });

  test("prefers remote configuration host.instance_name over api hostname", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "Particular.ServiceControl.Primary", health: "healthy", version: "6.19.3" }));
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

  test("maps a reachable primary root to healthy with version from the response header", async () => {
    getRoot.mockResolvedValue([{ headers: new Headers({ "X-Particular-Version": "6.19.3" }) }, { name: "Particular.ServiceControl.Primary" }] as never);
    getRemoteInstances.mockResolvedValue([]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.primary?.name).toBe("Particular.ServiceControl.Primary");
    expect(store.primary?.health).toBe("healthy");
    expect(store.primary?.version).toBe("6.19.3");
  });

  test("uses host.instance_name from /api/configuration for the primary name", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "ServiceControl", health: "healthy", version: "6.19.3" }));
    getConfiguration.mockResolvedValue({ json: () => Promise.resolve({ host: { instance_name: "booger" } }) } as never);
    getRemoteInstances.mockResolvedValue([]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.primary?.name).toBe("booger");
    expect(store.primary?.health).toBe("healthy");
  });

  test("falls back to the root document name when configuration has no host.instance_name", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "Particular.ServiceControl.Primary", health: "healthy", version: "6.19.3" }));
    getConfiguration.mockResolvedValue({ json: () => Promise.resolve({ host: {} }) } as never);
    getRemoteInstances.mockResolvedValue([]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.primary?.name).toBe("Particular.ServiceControl.Primary");
  });

  test("uses cached remote instance type when an unavailable remote no longer has configuration", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "Particular.ServiceControl.Primary", health: "healthy", version: "6.19.3" }));
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
  });

  test("maps transport and retention fields from configuration and remotes", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "Particular.ServiceControl", health: "healthy", version: "6.19.3" }));
    getConfiguration.mockResolvedValue({
      json: () => Promise.resolve({
        host: { instance_name: "Particular.ServiceControl" },
        transport: {
          transport_type: "RabbitMQ.QuorumConventionalRouting",
          error_log_queue: "error.log",
          error_queue: "error",
          forward_error_messages: true,
        },
        data_retention: {
          error_retention_period: "14.00:00:00",
        },
      }),
    } as never);
    getRemoteInstances.mockResolvedValue([
      {
        api_uri: "http://localhost:33334/api/",
        version: "6.19.3",
        status: "online",
        configuration: {
          host: { instance_name: "Particular.ServiceControl.Audit" },
          data_retention: { audit_retention_period: "7.00:00:00" },
        },
      },
    ]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.primary?.transportType).toBe("RabbitMQ.QuorumConventionalRouting");
    expect(store.primary?.errorQueue).toBe("error");
    expect(store.primary?.errorLogQueue).toBe("error.log");
    expect(store.primary?.forwardErrorMessages).toBe(true);
    expect(store.primary?.errorRetentionPeriod).toBe("14.00:00:00");

    expect(store.remotes[0].auditRetentionPeriod).toBe("7.00:00:00");
    expect(store.remotes[0].errorRetentionPeriod).toBeUndefined();
  });

  test("skips remote discovery when the primary root is unavailable", async () => {
    getRoot.mockRejectedValue(new Error("primary unavailable"));
    getRemoteInstances.mockResolvedValue([
      {
        api_uri: "http://localhost:33334/api/",
        version: "6.19.3",
        status: "online",
        configuration: { data_retention: { audit_retention_period: "7.00:00:00" } },
      },
    ]);
    getMonitoringRoot.mockResolvedValue({ platform_health_status: "healthy", platform_health_version: "6.19.3" });

    const store = usePlatformModelStore();
    await store.refresh();

    expect(getRemoteInstances).not.toHaveBeenCalled();
    expect(store.primary?.health).toBe("unavailable");
    expect(store.remotes).toHaveLength(0);
    expect(store.monitoring?.health).toBe("healthy");
  });
});

function rootResponse({ name, health, version }: { name: string; health: "healthy" | "degraded" | "unavailable"; version: string }) {
  return [{ headers: new Headers({ "X-Particular-Version": version }) }, { name, platform_health_status: health, platform_health_version: version }] as never;
}
