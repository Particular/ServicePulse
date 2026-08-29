import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { isUpgradeAvailable } from "@/composables/serviceSemVer";
import { getBuiltInPlatformCheck } from "@/components/customchecks/builtInPlatformChecks";
import type { PlatformHealthResponse, PlatformHealthRow, PlatformHealthSeverity } from "@/resources/PlatformHealth";
import type CustomCheck from "@/resources/CustomCheck";
import type { PlatformInstance, PlatformModel } from "@/resources/PlatformModel";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";
import { useCustomChecksStore } from "@/stores/CustomChecksStore";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";

const supportCaseUrl = "https://customers.particular.net/request-support";
const serviceControlReleaseBaseUrl = "https://github.com/Particular/ServiceControl/releases/tag/";

export const usePlatformHealthStore = defineStore("PlatformHealthStore", () => {
  const payload = ref<PlatformHealthResponse | null>(null);
  const environmentAndVersionsStore = useEnvironmentAndVersionsStore();
  const platformModelStore = usePlatformModelStore();
  const customChecksStore = useCustomChecksStore();
  const { rawFailedChecks } = storeToRefs(customChecksStore);

  const severity = computed<PlatformHealthSeverity>(() => {
    const current = payload.value;
    if (!current) {
      return "none";
    }

    if (current.primary.health === "unavailable") {
      return "danger";
    }

    if (current.primary.health === "degraded") {
      return "warning";
    }

    if (current.remotes.some((remote) => remote.role === "remote-error" && remote.health !== "healthy")) {
      return "danger";
    }

    if (current.monitoring?.health === "unavailable") {
      return "danger";
    }

    if (current.remotes.some((remote) => remote.kind === "audit" && remote.health === "degraded")) {
      return "warning";
    }

    return "none";
  });

  const outdatedOnly = computed(() => severity.value === "none" && rows.value.some((row) => row.upgradeAvailable));

  const rows = computed<PlatformHealthRow[]>(() => {
    const current = payload.value;
    if (!current) {
      return [];
    }

    const platformChecks = normalizeChecks(rawFailedChecks.value);

    const latestServiceControlVersion = environmentAndVersionsStore.newVersions.newSCVersion.newscversionnumber || firstKnownVersion(current.primary.version, window.__platformHealth?.getState().primary.version);
    const latestServiceControlLink = environmentAndVersionsStore.newVersions.newSCVersion.newscversionlink || buildReleaseLink(latestServiceControlVersion);
    const latestMonitoringVersion = environmentAndVersionsStore.newVersions.newMVersion.newmversionnumber || firstKnownVersion(current.monitoring?.version, window.__platformHealth?.getState().monitoring?.version, latestServiceControlVersion);
    const latestMonitoringLink = environmentAndVersionsStore.newVersions.newMVersion.newmversionlink || buildReleaseLink(latestMonitoringVersion);

    const nextRows: PlatformHealthRow[] = [
      toRow(current.primary, latestServiceControlVersion, latestServiceControlLink, detailsForInstance(current.primary, current, platformChecks)),
      ...current.remotes.map((remote) => toRow(remote, latestServiceControlVersion, latestServiceControlLink, detailsForInstance(remote, current, platformChecks))),
    ];

    if (current.monitoring) {
      nextRows.push(toRow(current.monitoring, latestMonitoringVersion, latestMonitoringLink, detailsForInstance(current.monitoring, current, platformChecks)));
    }

    return nextRows;
  });

  const issueSummary = computed(() => {
    const current = payload.value;
    if (!current) {
      return "No issues detected.";
    }

    const issues: string[] = [];

    if (current.primary.health === "unavailable") {
      issues.push("primary Error instance unavailable");
    }

    if (current.primary.health === "degraded") {
      issues.push("primary Error instance degraded");
    }

    issues.push(...current.remotes.filter((remote) => remote.health === "degraded").map((remote) => `degraded ${formatInstanceType(remote.kind)}`));
    issues.push(...current.remotes.filter((remote) => remote.health === "unavailable").map((remote) => `unavailable ${formatInstanceType(remote.kind)}`));

    if (current.monitoring?.health === "unavailable") {
      issues.push("unavailable Monitoring instance");
    }

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

    payload.value = platformModelStore.model ? applyPlatformHealthChecks(platformModelStore.model, rawFailedChecks.value) : null;
  }

  return {
    payload,
    refresh,
    severity,
    outdatedOnly,
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

function toRow(instance: PlatformInstance, latestVersion: string, upgradeLink: string, details: string[]): PlatformHealthRow {
  return {
    type: formatRowType(instance),
    instanceName: instance.name,
    apiUrl: instance.apiUrl,
    version: instance.version,
    health: instance.health,
    note: formatRole(instance.role),
    upgradeAvailable: hasUpgrade(instance.version, latestVersion),
    latestVersion,
    upgradeLink,
    isExpandable: details.length > 0,
    details,
  };
}

function formatRowType(instance: PlatformInstance) {
  if (instance.kind === "audit") {
    return "Audit instance";
  }

  if (instance.kind === "monitoring") {
    return "Monitoring instance";
  }

  return "Error instance";
}

function formatRole(role: PlatformInstance["role"]) {
  switch (role) {
    case "primary-error":
      return "Primary error instance";
    case "remote-audit":
      return "Audit instance";
    case "remote-error":
      return "Regional error instance";
    case "monitoring":
      return "Monitoring instance";
  }
}

function formatInstanceType(instanceType: PlatformInstance["kind"]) {
  switch (instanceType) {
    case "audit":
      return "Audit instance";
    case "monitoring":
      return "Monitoring instance";
    default:
      return "Error instance";
  }
}

function hasUpgrade(currentVersion: string | null | undefined, latestVersion: string) {
  return !!currentVersion && !!latestVersion && isUpgradeAvailable(currentVersion, latestVersion);
}

function buildReleaseLink(version: string) {
  return version ? `${serviceControlReleaseBaseUrl}${version}` : "";
}

function firstKnownVersion(...versions: Array<string | null | undefined>) {
  return versions.find((version) => version && version !== "Unknown") ?? "";
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlatformHealthStore, import.meta.hot));
}

export type PlatformHealthStore = ReturnType<typeof usePlatformHealthStore>;

function applyPlatformHealthChecks(model: PlatformModel, checks: CustomCheck[]) {
  const platformChecks = normalizeChecks(checks).map(getBuiltInPlatformCheck);
  const primary = applyPlatformCheckHealthToPrimary(model.primary, platformChecks);
  const remotes = applyPlatformCheckHealthToRemotes(model.remotes, platformChecks);

  return {
    ...model,
    primary,
    remotes,
  } satisfies PlatformModel;
}

function detailsForInstance(instance: PlatformInstance, model: PlatformModel, checks: CustomCheck[]) {
  const matchingPlatformChecks = checks.filter((check) => matchesInstance(check, instance));
  const details = matchingPlatformChecks.map((check) => formatCustomCheckDetail(check));

  if (details.length > 0) {
    return details;
  }

  return fallbackDetails(instance, model);
}

function matchesInstance(check: CustomCheck, instance: PlatformInstance) {
  const platformCheck = getBuiltInPlatformCheck(check);
  if (!platformCheck) {
    return false;
  }

  switch (platformCheck.target) {
    case "primary":
      return instance.role === "primary-error";
    case "remote-error":
      return instance.role === "remote-error";
    case "audit":
      return instance.role === "remote-audit";
    case "transport":
      return instance.role === "remote-audit";
    default:
      return false;
  }
}

function formatCustomCheckDetail(check: CustomCheck) {
  return check.failure_reason ? `${check.custom_check_id}: ${check.failure_reason}` : check.custom_check_id;
}

function fallbackDetails(instance: PlatformInstance, model: PlatformModel) {
  if (instance.role === "monitoring" && instance.health === "unavailable") {
    return ["Monitoring root endpoint is unavailable."];
  }

  if (instance.role === "remote-error" && instance.health === "unavailable") {
    return ["Regional error instance is unavailable."];
  }

  if (instance.role === "remote-audit" && instance.health === "degraded") {
    return ["Audit instance is degraded."];
  }

  if (instance.role === "primary-error") {
    if (instance.health === "unavailable") {
      return ["Primary error instance is unavailable."];
    }

    if (instance.health === "degraded" && model.primary.health === "degraded") {
      return ["Primary error instance is degraded."];
    }
  }

  return [];
}

function applyPlatformCheckHealthToPrimary(primary: PlatformInstance, platformChecks: Array<ReturnType<typeof getBuiltInPlatformCheck>>) {
  if (platformChecks.some((check) => check?.target === "primary" && check.severity === "unavailable")) {
    return { ...primary, health: "unavailable" as const };
  }

  if (platformChecks.some((check) => check?.target === "primary" && check.severity === "degraded") && primary.health === "healthy") {
    return { ...primary, health: "degraded" as const };
  }

  return primary;
}

function applyPlatformCheckHealthToRemotes(remotes: PlatformInstance[], platformChecks: Array<ReturnType<typeof getBuiltInPlatformCheck>>) {
  const hasRemoteUnavailableCheck = platformChecks.some((check) => check?.target === "remote-error" && check.severity === "unavailable");
  const hasAuditDegradedCheck = platformChecks.some((check) => check?.target === "audit" && check.severity === "degraded");
  const hasTransportDegradedCheck = platformChecks.some((check) => check?.target === "transport" && check.severity === "degraded");

  return remotes.map((remote) => {
    if (remote.role === "remote-error" && hasRemoteUnavailableCheck) {
      return { ...remote, health: "unavailable" as const };
    }

    if (remote.role === "remote-audit" && (hasAuditDegradedCheck || hasTransportDegradedCheck) && remote.health === "healthy") {
      return { ...remote, health: "degraded" as const };
    }

    return remote;
  });
}

function normalizeChecks(checks: CustomCheck[] | unknown) {
  return Array.isArray(checks) ? checks : [];
}
