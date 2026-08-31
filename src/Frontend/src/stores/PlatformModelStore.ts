import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import serviceControlClient, { type ServiceControlRootDocument } from "@/components/serviceControlClient";
import monitoringClient, { type MonitoringRoot } from "@/components/monitoring/monitoringClient";
import { RemoteInstanceType, type RemoteInstance } from "@/resources/RemoteInstance";
import type { PlatformInstance, PlatformModel, ServicePulse } from "@/resources/PlatformModel";

export const usePlatformModelStore = defineStore("PlatformModelStore", () => {
  const model = ref<PlatformModel | null>(null);

  const primary = computed(() => model.value?.primary ?? null);
  const remotes = computed(() => model.value?.remotes ?? []);
  const monitoring = computed(() => model.value?.monitoring ?? null);
  const servicePulse = computed(() => model.value?.servicePulse ?? null);
  const auditInstances = computed(() => remotes.value.filter((instance) => instance.kind === "audit"));
  const errorInstances = computed(() => remotes.value.filter((instance) => instance.kind === "error"));

  async function refresh() {
    const [primaryRoot, remotesResponse, monitoringResponse] = await Promise.all([getPrimaryRoot(), getRemotes(), getMonitoringRoot()]);

    model.value = {
      primary: mapPrimary(primaryRoot),
      remotes: mapRemotes(remotesResponse),
      monitoring: mapMonitoring(monitoringResponse),
      servicePulse: mapServicePulse(),
    };
  }

  return {
    model,
    primary,
    remotes,
    monitoring,
    servicePulse,
    auditInstances,
    errorInstances,
    refresh,
  };
});

async function getPrimaryRoot(): Promise<PrimaryRootResult | null> {
  try {
    const [response, document] = await serviceControlClient.getRoot();
    return { document, version: response.headers.get("X-Particular-Version") ?? "" };
  } catch {
    return null;
  }
}

interface PrimaryRootResult {
  document: ServiceControlRootDocument;
  version: string;
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

function mapPrimary(primaryRoot: PrimaryRootResult | null): PlatformInstance {
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

  const { document, version } = primaryRoot;

  return {
    id: "primary",
    name: document.name,
    kind: "error",
    role: "primary-error",
    version: document.platform_health_version ?? version,
    health: document.platform_health_status ?? "healthy",
    apiUrl: serviceControlClient.url ?? "",
  };
}

function mapRemotes(remotes: RemoteInstance[]): PlatformInstance[] {
  return remotes.map((remote, index) => {
    const isError = isRemoteErrorInstance(remote);
    const kind = isError ? "error" : "audit";

    return {
      id: remote.platform_health_id ?? `remote-${index}`,
      name: remote.configuration?.host?.instance_name ?? extractInstanceName(remote.api_uri),
      kind,
      role: isError ? "remote-error" : "remote-audit",
      version: remote.version,
      health: remote.platform_health_status ?? (remote.status === "online" ? "healthy" : "unavailable"),
      apiUrl: remote.api_uri,
    };
  });
}

function isRemoteErrorInstance(remote: RemoteInstance) {
  if (remote.cachedInstanceType === RemoteInstanceType.Error) {
    return true;
  }

  if (remote.cachedInstanceType === RemoteInstanceType.Audit) {
    return false;
  }

  return remote.configuration?.data_retention?.error_retention_period !== undefined;
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
    version: monitoringRoot?.platform_health_version ?? monitoringRoot?.version ?? "Unknown",
    health: monitoringRoot?.platform_health_status ?? "healthy",
    apiUrl: monitoringClient.url ?? "",
  };
}

function mapServicePulse(): ServicePulse {
  return {
    name: "ServicePulse",
    version: window.defaultConfig?.version ?? "Unknown",
    health: "healthy",
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
