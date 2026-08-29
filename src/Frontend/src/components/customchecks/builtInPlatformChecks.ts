import type CustomCheck from "@/resources/CustomCheck";

export type PlatformCheckTarget = "primary" | "audit" | "remote-error" | "transport" | "none";
export type PlatformCheckSeverity = "degraded" | "unavailable" | "ignore";

export interface BuiltInPlatformCheck {
  category: string;
  customCheckId: string;
  target: PlatformCheckTarget;
  severity: PlatformCheckSeverity;
}

const builtInPlatformChecks: BuiltInPlatformCheck[] = [
  { category: "Configuration", customCheckId: "Saga Audit Configuration", target: "none", severity: "ignore" },
  { category: "Health", customCheckId: "ServiceControl Primary Instance", target: "primary", severity: "unavailable" },
  { category: "Health", customCheckId: "ServiceControl Remotes", target: "remote-error", severity: "unavailable" },
  { category: "ServiceControl Health", customCheckId: "Error Message Ingestion Process", target: "primary", severity: "degraded" },
  { category: "ServiceControl Health", customCheckId: "Error Message Ingestion", target: "primary", severity: "degraded" },
  { category: "ServiceControl Health", customCheckId: "Error Database Index Errors", target: "primary", severity: "degraded" },
  { category: "ServiceControl Health", customCheckId: "Error Database Index Lag", target: "primary", severity: "degraded" },
  { category: "Storage space", customCheckId: "ServiceControl database", target: "primary", severity: "degraded" },
  { category: "ServiceControl Health", customCheckId: "Message Ingestion Process", target: "primary", severity: "degraded" },
  { category: "ServiceControl Health", customCheckId: "RavenDB dirty memory", target: "primary", severity: "degraded" },
  { category: "ServiceControl Health", customCheckId: "Audit Message Ingestion Process", target: "audit", severity: "degraded" },
  { category: "ServiceControl.Audit Health", customCheckId: "Audit Message Ingestion", target: "audit", severity: "degraded" },
  { category: "ServiceControl.Audit Health", customCheckId: "Audit Database Index Lag", target: "audit", severity: "degraded" },
  { category: "Storage space", customCheckId: "ServiceControl.Audit database", target: "audit", severity: "degraded" },
  { category: "ServiceControl.Audit Health", customCheckId: "Audit Message Ingestion Process", target: "audit", severity: "degraded" },
  { category: "ServiceControl.Audit Health", customCheckId: "RavenDB dirty memory", target: "audit", severity: "degraded" },
  { category: "Transport", customCheckId: "Dead Letter Queue", target: "transport", severity: "degraded" },
];

const builtInPlatformCheckMap = new Map(builtInPlatformChecks.map((check) => [toCheckKey(check.category, check.customCheckId), check]));

export function isBuiltInPlatformCheck(check: CustomCheck) {
  return builtInPlatformCheckMap.has(getBuiltInPlatformCheckKey(check));
}

export function getBuiltInPlatformCheck(check: CustomCheck) {
  return builtInPlatformCheckMap.get(getBuiltInPlatformCheckKey(check)) ?? null;
}

export function getBuiltInPlatformCheckKey(check: Pick<CustomCheck, "category" | "custom_check_id">) {
  return toCheckKey(check.category, check.custom_check_id);
}

function toCheckKey(category: string, customCheckId: string) {
  return `${category}::${customCheckId}`;
}
