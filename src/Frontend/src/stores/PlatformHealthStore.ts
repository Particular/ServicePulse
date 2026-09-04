import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { isUpgradeAvailable } from "@/composables/serviceSemVer";
import type { PlatformHealthResponse, PlatformHealthRow, PlatformHealthSeverity } from "@/resources/PlatformHealth";
import type CustomCheck from "@/resources/CustomCheck";
import type { PlatformInstance, PlatformModel, ServicePulse } from "@/resources/PlatformModel";
import logger from "@/logger";
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
  const { model: platformModel } = storeToRefs(platformModelStore);

  const currentModel = computed(() => {
    if (!platformModel.value) {
      return null;
    }

    return applyPlatformHealthChecks(platformModel.value, rawFailedChecks.value);
  });

  const severity = computed<PlatformHealthSeverity>(() => {
    const current = currentModel.value;
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

    if (current.remotes.some((remote) => remote.kind === "audit" && remote.health === "unavailable")) {
      return "danger";
    }

    if (current.remotes.some((remote) => remote.kind === "audit" && remote.health === "degraded")) {
      return "warning";
    }

    return "none";
  });

  const outdatedOnly = computed(() => severity.value === "none" && rows.value.some((row) => row.upgradeAvailable));

  const rows = computed<PlatformHealthRow[]>(() => {
    const current = currentModel.value;
    if (!current) {
      return [];
    }

    const platformChecks = normalizeChecks(rawFailedChecks.value);

    const latestServiceControlVersion = environmentAndVersionsStore.newVersions.newSCVersion.newscversionnumber || firstKnownVersion(current.primary.version, window.__platformHealth?.getState().primary.version);
    const latestServiceControlLink = environmentAndVersionsStore.newVersions.newSCVersion.newscversionlink || buildReleaseLink(latestServiceControlVersion);
    const latestMonitoringVersion = environmentAndVersionsStore.newVersions.newMVersion.newmversionnumber || firstKnownVersion(current.monitoring?.version, window.__platformHealth?.getState().monitoring?.version, latestServiceControlVersion);
    const latestMonitoringLink = environmentAndVersionsStore.newVersions.newMVersion.newmversionlink || buildReleaseLink(latestMonitoringVersion);
    const latestServicePulseVersion = environmentAndVersionsStore.newVersions.newSPVersion.newspversionnumber;
    const latestServicePulseLink = environmentAndVersionsStore.newVersions.newSPVersion.newspversionlink;

    const nextRows: PlatformHealthRow[] = [
      toRow(current.primary, latestServiceControlVersion, latestServiceControlLink, detailsForInstance(current.primary, current, platformChecks)),
      ...current.remotes.map((remote) => toRow(remote, latestServiceControlVersion, latestServiceControlLink, detailsForInstance(remote, current, platformChecks))),
    ];

    if (current.monitoring) {
      nextRows.push(toRow(current.monitoring, latestMonitoringVersion, latestMonitoringLink, detailsForInstance(current.monitoring, current, platformChecks)));
    }

    nextRows.push(toServicePulseRow(current.servicePulse, latestServicePulseVersion, latestServicePulseLink));

    return nextRows;
  });

  const issueSummary = computed(() => {
    const current = currentModel.value;
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
    if (!currentModel.value) {
      return "";
    }

    return JSON.stringify(
      {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        supportCaseUrl,
        platformHealth: currentModel.value,
        customChecks: {
          failed: rawFailedChecks.value,
        },
      },
      null,
      2
    );
  });

  async function refresh() {
    const [platformModelResult, customChecksResult] = await Promise.allSettled([platformModelStore.refresh(), customChecksStore.refresh()]);

    if (platformModelResult.status === "rejected") {
      throw platformModelResult.reason;
    }

    if (customChecksResult.status === "rejected") {
      // Platform health still renders from platform availability data when custom checks cannot be loaded.
      logger.warn("Unable to refresh custom checks for platform health", customChecksResult.reason);
    }

    payload.value = currentModel.value;
  }

  watch(currentModel, (model) => {
    payload.value = model;
  });

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

function toRow(instance: PlatformInstance, latestVersion: string, upgradeLink: string, healthDetails: string[]): PlatformHealthRow {
  const infoDetails = [`API: ${instance.apiUrl}`];

  if (instance.transportType) {
    infoDetails.push(`Transport: ${instance.transportType}`);
  }

  if (instance.errorQueue) {
    infoDetails.push(`Error queue: ${instance.errorQueue}`);
  }

  if (instance.errorLogQueue) {
    infoDetails.push(`Error log queue: ${instance.errorLogQueue}`);
  }

  if (instance.forwardErrorMessages !== undefined) {
    infoDetails.push(`Forward error messages: ${instance.forwardErrorMessages ? "Yes" : "No"}`);
  }

  if (instance.errorRetentionPeriod) {
    infoDetails.push(`Error retention: ${formatTimeSpan(instance.errorRetentionPeriod)}`);
  }

  if (instance.auditRetentionPeriod) {
    infoDetails.push(`Audit retention: ${formatTimeSpan(instance.auditRetentionPeriod)}`);
  }

  return {
    type: formatRowType(instance),
    name: instance.name,
    version: instance.version,
    health: instance.health,
    note: formatRole(instance.role),
    upgradeAvailable: hasUpgrade(instance.version, latestVersion),
    latestVersion,
    upgradeLink,
    infoDetails,
    healthDetails,
  };
}

function toServicePulseRow(servicePulse: ServicePulse, latestVersion: string, upgradeLink: string): PlatformHealthRow {
  return {
    type: "ServicePulse",
    name: servicePulse.name,
    version: servicePulse.version,
    health: servicePulse.health,
    note: "ServicePulse",
    upgradeAvailable: hasUpgrade(servicePulse.version, latestVersion),
    latestVersion,
    upgradeLink,
    infoDetails: [],
    healthDetails: [],
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
      return "Remote error instance";
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
  const normalizedChecks = normalizeChecks(checks);
  const primary = applyPlatformCheckHealthToInstance(model.primary, normalizedChecks);
  const remotes = model.remotes.map((remote) => applyPlatformCheckHealthToInstance(remote, normalizedChecks));

  return {
    ...model,
    primary,
    remotes,
  } satisfies PlatformModel;
}

function detailsForInstance(instance: PlatformInstance, model: PlatformModel, checks: CustomCheck[]) {
  const matchingPlatformChecks = checks.filter((check) => matchesInstance(check, instance));
  const details = matchingPlatformChecks.flatMap((check) => formatCustomCheckDetails(check));

  if (details.length > 0) {
    return details;
  }

  return fallbackDetails(instance, model);
}

function matchesInstance(check: CustomCheck, instance: PlatformInstance) {
  if (!check.internal) {
    return false;
  }

  return sameInstanceName(check.originating_endpoint.name, instance.name);
}

function formatCustomCheckDetails(check: CustomCheck) {
  const summary = check.failure_reason ? `${check.custom_check_id}: ${check.failure_reason}` : check.custom_check_id;

  return [summary, `Reported at: ${check.reported_at}`];
}

function fallbackDetails(instance: PlatformInstance, model: PlatformModel) {
  if (instance.role === "monitoring" && instance.health === "unavailable") {
    return ["Monitoring root endpoint is unavailable."];
  }

  if (instance.role === "remote-error" && instance.health === "unavailable") {
    return ["Remote error instance is unavailable."];
  }

  if (instance.role === "remote-audit" && instance.health === "degraded") {
    return ["Audit instance is degraded."];
  }

  if (instance.role === "remote-audit" && instance.health === "unavailable") {
    return ["Audit instance is unavailable."];
  }

  if (instance.role === "primary-error") {
    if (instance.health === "unavailable") {
      return ["Primary error instance is unavailable. Remote instance status is also unavailable."];
    }

    if (instance.health === "degraded" && model.primary.health === "degraded") {
      return ["Primary error instance is degraded."];
    }
  }

  return [];
}

function applyPlatformCheckHealthToInstance(instance: PlatformInstance, checks: CustomCheck[]) {
  const matchingPlatformChecks = checks.filter((check) => matchesInstance(check, instance));

  if (matchingPlatformChecks.length > 0 && instance.health === "healthy") {
    return { ...instance, health: "degraded" as const };
  }

  return instance;
}

function normalizeChecks(checks: CustomCheck[] | unknown) {
  return Array.isArray(checks) ? checks : [];
}

function sameInstanceName(left: string, right: string) {
  return left.localeCompare(right, undefined, { sensitivity: "accent" }) === 0;
}

function formatTimeSpan(timeSpan: string): string {
  const match = timeSpan.match(/^(?:(\d+)\.)?(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    return timeSpan;
  }

  const days = parseInt(match[1] ?? "0", 10);
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }

  return parts.length > 0 ? parts.join(", ") : "0 days";
}
