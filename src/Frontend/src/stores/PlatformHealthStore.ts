import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { isUpgradeAvailable } from "@/composables/serviceSemVer";
import type { PlatformHealthResponse, PlatformHealthRow, PlatformHealthSeverity } from "@/resources/PlatformHealth";
import type { PlatformInstanceRole } from "@/resources/PlatformModel";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";

const supportCaseUrl = "https://customers.particular.net/request-support";
const serviceControlReleaseBaseUrl = "https://github.com/Particular/ServiceControl/releases/tag/";

export const usePlatformHealthStore = defineStore("PlatformHealthStore", () => {
  const payload = ref<PlatformHealthResponse | null>(null);
  const environmentAndVersionsStore = useEnvironmentAndVersionsStore();
  const platformModelStore = usePlatformModelStore();

  const isMultiRegion = computed(() => payload.value?.mode === "multi-region");

  const severity = computed<PlatformHealthSeverity>(() => {
    const current = payload.value;
    if (!current) {
      return "none";
    }

    if (current.primary.status === "unavailable") {
      return "danger";
    }

    if (current.mode === "multi-region" && current.remotes.some((remote) => remote.instanceType === "error" && remote.status !== "healthy")) {
      return "danger";
    }

    if (current.monitoring?.configured && current.monitoring.status === "unavailable") {
      return "danger";
    }

    if (current.remotes.some((remote) => remote.instanceType === "audit" && remote.status === "degraded")) {
      return "warning";
    }

    if (current.warnings.length > 0) {
      return "warning";
    }

    return "none";
  });

  const rows = computed<PlatformHealthRow[]>(() => {
    const current = payload.value;
    if (!current) {
      return [];
    }

    const latestServiceControlVersion = environmentAndVersionsStore.newVersions.newSCVersion.newscversionnumber || firstKnownVersion(current.primary.version, window.__platformHealth?.getState().primary.version);
    const latestServiceControlLink = environmentAndVersionsStore.newVersions.newSCVersion.newscversionlink || buildReleaseLink(latestServiceControlVersion);
    const latestMonitoringVersion = environmentAndVersionsStore.newVersions.newMVersion.newmversionnumber || firstKnownVersion(current.monitoring?.version, window.__platformHealth?.getState().monitoring?.version, latestServiceControlVersion);
    const latestMonitoringLink = environmentAndVersionsStore.newVersions.newMVersion.newmversionlink || buildReleaseLink(latestMonitoringVersion);

    const nextRows: PlatformHealthRow[] = [toRow(current.primary, latestServiceControlVersion, latestServiceControlLink), ...current.remotes.map((remote) => toRow(remote, latestServiceControlVersion, latestServiceControlLink))];

    if (current.monitoring?.configured) {
      nextRows.push({
        type: "Monitoring instance",
        instanceName: current.monitoring.name,
        version: current.monitoring.version,
        health: current.monitoring.status,
        note: "Monitoring instance",
        upgradeAvailable: hasMonitoringUpgrade(current.monitoring.version, latestMonitoringVersion),
        latestVersion: latestMonitoringVersion,
        upgradeLink: latestMonitoringLink,
      });
    }

    return nextRows;
  });

  const issueSummary = computed(() => {
    const current = payload.value;
    if (!current) {
      return "No issues detected.";
    }

    const issues: string[] = [];

    if (current.primary.status === "unavailable") {
      issues.push("primary Error instance unavailable");
    }

    issues.push(...current.remotes.filter((remote) => remote.status === "degraded").map((remote) => `degraded ${formatInstanceType(remote.instanceType)}`));
    issues.push(...current.remotes.filter((remote) => remote.status === "unavailable").map((remote) => `unavailable ${formatInstanceType(remote.instanceType)}`));

    if (current.mode === "single-region" && current.monitoring?.configured && current.monitoring.status === "unavailable") {
      issues.push("unavailable Monitoring instance");
    }

    issues.push(...current.warnings.map((warning) => `topology warning: ${warning}`));

    if (issues.length === 0) {
      return "No issues detected.";
    }

    return `${issues.length} issue${issues.length === 1 ? "" : "s"} detected: ${issues.join(", ")}.`;
  });

  const supportDownloadJson = computed(() => {
    if (!payload.value) {
      return "";
    }

    return JSON.stringify(
      {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        supportCaseUrl,
        platformHealth: payload.value,
      },
      null,
      2
    );
  });

  async function refresh() {
    await platformModelStore.refresh();

    payload.value = {
      mode: platformModelStore.model?.mode ?? "single-region",
      primary: {
        name: platformModelStore.primary?.name ?? "Particular.ServiceControl",
        instanceType: "error",
        role: toPlatformHealthRole(platformModelStore.primary?.role),
        version: platformModelStore.primary?.version ?? "Unknown",
        status: platformModelStore.primary?.health ?? "unavailable",
        ingestErrorMessages: platformModelStore.primary?.ingestErrorMessages,
      },
      remotes: platformModelStore.remotes.map((instance) => ({
        name: instance.name,
        instanceType: instance.kind === "error" ? "error" : "audit",
        role: instance.role === "remote-error" ? "remote-error" : "remote-audit",
        version: instance.version,
        status: instance.health,
        ingestErrorMessages: instance.ingestErrorMessages,
      })),
      monitoring: platformModelStore.monitoring
        ? {
            configured: platformModelStore.monitoring.configured,
            name: platformModelStore.monitoring.name,
            instanceType: "monitoring",
            version: platformModelStore.monitoring.version,
            status: platformModelStore.monitoring.health,
          }
        : null,
      warnings: platformModelStore.warnings,
    };
  }

  return {
    payload,
    refresh,
    severity,
    isMultiRegion,
    issueSummary,
    rows,
    latestServiceControlVersion: computed(() => {
      const current = payload.value;
      if (!current) {
        return "";
      }

      return environmentAndVersionsStore.newVersions.newSCVersion.newscversionnumber || firstKnownVersion(current.primary.version, window.__platformHealth?.getState().primary.version);
    }),
    supportCaseUrl,
    supportDownloadJson,
  };
});

function toRow(instance: PlatformHealthResponse["primary"], latestVersion: string, upgradeLink: string): PlatformHealthRow {
  return {
    type: formatRowType(instance),
    instanceName: instance.name,
    version: instance.version,
    health: instance.status,
    note: formatRole(instance.role),
    upgradeAvailable: hasUpgrade(instance.version, latestVersion),
    latestVersion,
    upgradeLink,
  };
}

function formatRowType(instance: PlatformHealthResponse["primary"]) {
  if (instance.instanceType === "audit") {
    return "Audit instance";
  }

  if (instance.role === "cross-region-primary") {
    return "Error instance";
  }

  return "Error instance";
}

function formatRole(role: PlatformHealthResponse["primary"]["role"]) {
  switch (role) {
    case "primary-error":
      return "Primary error processing instance";
    case "cross-region-primary":
      return "Connected cross-region primary";
    case "remote-audit":
      return "Audit instance";
    case "remote-error":
      return "Regional error instance";
  }
}

function formatInstanceType(instanceType: PlatformHealthResponse["primary"]["instanceType"]) {
  return instanceType === "audit" ? "Audit instance" : "Error instance";
}

function hasUpgrade(currentVersion: string, latestVersion: string) {
  return !!latestVersion && isUpgradeAvailable(currentVersion, latestVersion);
}

function hasMonitoringUpgrade(currentVersion: string, latestVersion: string) {
  return !!latestVersion && isUpgradeAvailable(currentVersion, latestVersion);
}

function buildReleaseLink(version: string) {
  return version ? `${serviceControlReleaseBaseUrl}${version}` : "";
}

function firstKnownVersion(...versions: Array<string | null | undefined>) {
  return versions.find((version) => version && version !== "Unknown") ?? "";
}

function toPlatformHealthRole(role: PlatformInstanceRole | undefined): PlatformHealthResponse["primary"]["role"] {
  if (role === "cross-region-primary") {
    return role;
  }

  return "primary-error";
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlatformHealthStore, import.meta.hot));
}

export type PlatformHealthStore = ReturnType<typeof usePlatformHealthStore>;
