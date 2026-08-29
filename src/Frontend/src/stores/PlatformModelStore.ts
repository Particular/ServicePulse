import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import serviceControlClient, { type ServiceControlRootDocument } from "@/components/serviceControlClient";
import monitoringClient, { type MonitoringRoot } from "@/components/monitoring/monitoringClient";
import type { RemoteInstance } from "@/resources/RemoteInstance";
import type { PlatformInstance, PlatformModel } from "@/resources/PlatformModel";

export const usePlatformModelStore = defineStore("PlatformModelStore", () => {
  const model = ref<PlatformModel | null>(null);

  const primary = computed(() => model.value?.primary ?? null);
  const remotes = computed(() => model.value?.remotes ?? []);
  const monitoring = computed(() => model.value?.monitoring ?? null);
  const auditInstances = computed(() => remotes.value.filter((instance) => instance.kind === "audit"));
  const errorInstances = computed(() => remotes.value.filter((instance) => instance.kind === "error"));
  const isMultiRegion = computed(() => model.value?.remotes.some((instance) => instance.role === "remote-error") ?? false);

  async function refresh() {
    const [primaryRoot, remotesResponse, monitoringResponse] = await Promise.all([getPrimaryRoot(), getRemotes(), getMonitoringRoot()]);

    model.value = {
      primary: mapPrimary(primaryRoot),
      remotes: mapRemotes(remotesResponse),
      monitoring: mapMonitoring(monitoringResponse),
    };
  }

  return {
    model,
    primary,
    remotes,
    monitoring,
    auditInstances,
    errorInstances,
    isMultiRegion,
    refresh,
  };
});

async function getPrimaryRoot(): Promise<ServiceControlRootDocument | null> {
  try {
    return await serviceControlClient.getRoot();
  } catch {
    return null;
  }
}

async function getRemotes(): Promise<RemoteInstance[]> {
  try {
    return await serviceControlClient.getRemoteInstances();
  } catch {
    return [];
  }
}

async function getMonitoringRoot(): Promise<MonitoringRoot | null> {
  if (!monitoringClient.isMonitoringEnabled) {
    return null;
  }

  try {
    return await monitoringClient.getMonitoringRoot();
  } catch {
    return {
      platform_health_status: "unavailable",
      platform_health_version: "Unknown",
    };
  }
}

function mapPrimary(primaryRoot: ServiceControlRootDocument | null): PlatformInstance {
  if (!primaryRoot) {
    return {
      id: "primary",
      name: "Particular.ServiceControl",
      kind: "error",
      role: "primary-error",
      version: "Unknown",
      health: "unavailable",
      apiUrl: serviceControlClient.url ?? "",
    };
  }

  return {
    id: "primary",
    name: primaryRoot.name,
    kind: "error",
    role: "primary-error",
    version: primaryRoot.platform_health_version,
    health: primaryRoot.platform_health_status,
    apiUrl: serviceControlClient.url ?? "",
  };
}

function mapRemotes(remotes: RemoteInstance[]): PlatformInstance[] {
  return remotes.map((remote, index) => {
    const isError = remote.configuration?.data_retention?.error_retention_period !== undefined;
    const kind = isError ? "error" : "audit";

    return {
      id: remote.platform_health_id ?? `remote-${index}`,
      name: extractInstanceName(remote.api_uri),
      kind,
      role: isError ? "remote-error" : "remote-audit",
      version: remote.version,
      health: remote.platform_health_status ?? (remote.status === "online" ? "healthy" : "unavailable"),
      apiUrl: remote.api_uri,
    };
  });
}

function mapMonitoring(monitoringRoot: MonitoringRoot | null): PlatformInstance | null {
  if (!monitoringClient.isMonitoringEnabled || monitoringRoot === null) {
    return null;
  }

  return {
    id: "monitoring",
    name: "Particular.ServiceControl.Monitoring",
    kind: "monitoring",
    role: "monitoring",
    version: monitoringRoot?.platform_health_version ?? "Unknown",
    health: monitoringRoot?.platform_health_status ?? "healthy",
    apiUrl: monitoringClient.url ?? "",
  };
}

function extractInstanceName(apiUri: string) {
  try {
    const uri = new URL(apiUri);
    return uri.hostname;
  } catch {
    return apiUri;
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlatformModelStore, import.meta.hot));
}

export type PlatformModelStore = ReturnType<typeof usePlatformModelStore>;
