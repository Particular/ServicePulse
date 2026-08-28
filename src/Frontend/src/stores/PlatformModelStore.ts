import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import monitoringClient from "@/components/monitoring/monitoringClient";
import { authFetch } from "@/composables/useAuthenticatedFetch";
import type RootUrls from "@/resources/RootUrls";
import type { RemoteInstance } from "@/resources/RemoteInstance";
import type { PlatformInstance, PlatformInstanceHealth, PlatformModel, PlatformTopologyMode } from "@/resources/PlatformModel";

interface ServiceControlRoot {
  name?: string;
  platform_health_status?: PlatformInstanceHealth;
  platform_health_mode?: PlatformTopologyMode;
  platform_health_warnings?: string[];
  platform_health_version?: string;
}

type ServiceControlRootDocument = RootUrls & ServiceControlRoot;

interface MonitoringRoot {
  platform_health_status?: PlatformInstanceHealth;
  platform_health_version?: string;
}

export const usePlatformModelStore = defineStore("PlatformModelStore", () => {
  const model = ref<PlatformModel | null>(null);

  const primary = computed(() => model.value?.primary ?? null);
  const remotes = computed(() => model.value?.remotes ?? []);
  const monitoring = computed(() => model.value?.monitoring ?? null);
  const auditInstances = computed(() => remotes.value.filter((instance) => instance.kind === "audit"));
  const errorInstances = computed(() => remotes.value.filter((instance) => instance.kind === "error"));
  const isMultiRegion = computed(() => model.value?.mode === "multi-region");
  const warnings = computed(() => model.value?.warnings ?? []);

  async function refresh() {
    const [primaryRoot, remotesResponse, monitoringResponse] = await Promise.all([getPrimaryRoot(), getRemotes(), getMonitoringRoot()]);
    const mode = detectMode(primaryRoot, remotesResponse);

    model.value = {
      mode,
      primary: mapPrimary(primaryRoot, mode),
      remotes: mapRemotes(remotesResponse),
      monitoring: mapMonitoring(monitoringResponse),
      warnings: primaryRoot?.platform_health_warnings ?? readDevWarnings(),
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
    warnings,
    refresh,
  };
});

async function getPrimaryRoot(): Promise<ServiceControlRootDocument | null> {
  try {
    const [, data] = await serviceControlClient.fetchTypedFromServiceControl<ServiceControlRootDocument>("");
    return data;
  } catch {
    return null;
  }
}

async function getRemotes(): Promise<RemoteInstance[]> {
  try {
    const [, data] = await serviceControlClient.fetchTypedFromServiceControl<RemoteInstance[]>("configuration/remotes");
    return data;
  } catch {
    return [];
  }
}

async function getMonitoringRoot(): Promise<MonitoringRoot | null> {
  if (!monitoringClient.isMonitoringEnabled) {
    return null;
  }

  try {
    const response = await authFetch(`${monitoringClient.url ?? ""}`);
    if (!response.ok) {
      throw new Error("Monitoring unavailable");
    }
    return (await response.json()) as MonitoringRoot;
  } catch {
    return {
      platform_health_status: "unavailable",
      platform_health_version: "Unknown",
    };
  }
}

function mapPrimary(primaryRoot: ServiceControlRootDocument | null, mode: PlatformTopologyMode): PlatformInstance | null {
  if (!primaryRoot) {
    return {
      id: "primary",
      name: "Particular.ServiceControl",
      kind: "error",
      role: mode === "multi-region" ? "cross-region-primary" : "primary-error",
      version: "Unknown",
      health: "unavailable",
      configured: true,
      ingestErrorMessages: mode !== "multi-region",
    };
  }

  return {
    id: "primary",
    name: primaryRoot.name || "Particular.ServiceControl",
    kind: "error",
    role: mode === "multi-region" ? "cross-region-primary" : "primary-error",
    version: primaryRoot.platform_health_version ?? "Unknown",
    health: primaryRoot.platform_health_status ?? "healthy",
    configured: true,
    sourceUrl: serviceControlClient.url,
    ingestErrorMessages: mode !== "multi-region",
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
      configured: true,
      sourceUrl: remote.api_uri,
      ingestErrorMessages: isError ? true : undefined,
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
    configured: true,
    sourceUrl: monitoringClient.url,
  };
}

function detectMode(primaryRoot: ServiceControlRootDocument | null, remotes: RemoteInstance[]): PlatformTopologyMode {
  if (primaryRoot?.platform_health_mode) {
    return primaryRoot.platform_health_mode;
  }

  const primaryName = primaryRoot?.name?.toLowerCase() ?? "";
  const hasCrossRegionName = primaryName.includes("crossregion") || primaryName.includes("cross-region");
  const hasRemoteErrors = remotes.some((remote) => remote.configuration?.data_retention?.error_retention_period !== undefined);

  return hasCrossRegionName || hasRemoteErrors ? "multi-region" : "single-region";
}

function extractInstanceName(apiUri: string) {
  try {
    const uri = new URL(apiUri);
    return uri.hostname;
  } catch {
    return apiUri;
  }
}

function readDevWarnings() {
  return window.__platformHealth?.getState().warnings ?? [];
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlatformModelStore, import.meta.hot));
}

export type PlatformModelStore = ReturnType<typeof usePlatformModelStore>;
