import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";
import { usePlatformHealthStore } from "@/stores/PlatformHealthStore";
import { useCustomChecksStore } from "@/stores/CustomChecksStore";
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
      json: () =>
        Promise.resolve({
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

  test("maps the storage type the primary reports in its configuration", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "Particular.ServiceControl", health: "healthy", version: "7.0.0" }));
    getConfiguration.mockResolvedValue({ json: () => Promise.resolve({ host: {}, storage: { storage_type: "SQLServer" } }) } as never);
    getRemoteInstances.mockResolvedValue([]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.primary?.storageType).toBe("SQLServer");
  });

  test("leaves the storage type undefined when the primary does not report one", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "Particular.ServiceControl", health: "healthy", version: "7.0.0" }));
    getConfiguration.mockResolvedValue({ json: () => Promise.resolve({ host: {} }) } as never);
    getRemoteInstances.mockResolvedValue([]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.primary?.storageType).toBeUndefined();
  });

  test("maps the persistence type from the primary and from error and audit remotes", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "Particular.ServiceControl", health: "healthy", version: "6.19.3" }));
    getConfiguration.mockResolvedValue({ json: () => Promise.resolve({ storage: { storage_type: "SQLServer" } }) } as never);
    getRemoteInstances.mockResolvedValue([
      { api_uri: "http://localhost:33334/api/", version: "6.19.3", status: "online", configuration: { data_retention: { error_retention_period: "14.00:00:00" }, storage: { storage_type: "RavenDB" } } },
      { api_uri: "http://localhost:33335/api/", version: "6.19.3", status: "online", configuration: { data_retention: { audit_retention_period: "7.00:00:00" }, persistence: { persistence_type: "PostgreSQL" } } },
    ]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.primary?.persistenceType).toBe("SQLServer");
    expect(store.remotes[0].persistenceType).toBe("RavenDB");
    expect(store.remotes[1].persistenceType).toBe("PostgreSQL");
  });

  test("prefers storage.storage_type over persistence.persistence_type on a remote", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "Particular.ServiceControl", health: "healthy", version: "6.19.3" }));
    getRemoteInstances.mockResolvedValue([{ api_uri: "http://localhost:33334/api/", version: "6.19.3", status: "online", configuration: { storage: { storage_type: "RavenDB" }, persistence: { persistence_type: "raw" } } }]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();

    expect(store.remotes[0].persistenceType).toBe("RavenDB");
  });

  test("leaves the persistence type undefined when responses omit it and clears it on refresh", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "Particular.ServiceControl", health: "healthy", version: "6.19.3" }));
    getConfiguration.mockResolvedValueOnce({ json: () => Promise.resolve({ storage: { storage_type: "RavenDB" } }) } as never);
    getRemoteInstances.mockResolvedValueOnce([{ api_uri: "http://localhost:33334/api/", version: "6.19.3", status: "online", configuration: { persistence: { persistence_type: "PostgreSQL" } } }]);
    getMonitoringRoot.mockResolvedValue(null);

    const store = usePlatformModelStore();
    await store.refresh();
    expect(store.primary?.persistenceType).toBe("RavenDB");
    expect(store.remotes[0].persistenceType).toBe("PostgreSQL");

    getConfiguration.mockResolvedValueOnce({ json: () => Promise.resolve({ host: {} }) } as never);
    getRemoteInstances.mockResolvedValueOnce([{ api_uri: "http://localhost:33334/api/", version: "6.19.3", status: "online", configuration: {} }]);
    await store.refresh();

    expect(store.primary?.persistenceType).toBeUndefined();
    expect(store.remotes[0].persistenceType).toBeUndefined();
  });

  test("includes the persistence type but not persistence_settings in the support JSON", async () => {
    getRoot.mockResolvedValue(rootResponse({ name: "Particular.ServiceControl", health: "healthy", version: "6.19.3" }));
    getConfiguration.mockResolvedValue({
      json: () =>
        Promise.resolve({
          storage: { storage_type: "SQLServer" },
          persistence_settings: { connection_string: "SENTINEL_CONNECTION_STRING", client_certificate_password: "SENTINEL_CERT_PASSWORD", client_certificate_base64: "SENTINEL_CERT_BASE64" },
        }),
    } as never);
    getRemoteInstances.mockResolvedValue([]);
    getMonitoringRoot.mockResolvedValue(null);
    useCustomChecksStore().refresh = vi.fn(() => Promise.resolve());

    const healthStore = usePlatformHealthStore();
    await healthStore.refresh();

    expect(healthStore.supportDownloadJson).toContain("SQLServer");
    expect(healthStore.supportDownloadJson).not.toContain("SENTINEL");
    expect(healthStore.supportDownloadJson).not.toContain("persistence_settings");
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
