import * as defaultScenario from "./default";
import * as auditNoInstance from "./audit-no-instance";
import * as auditUnavailable from "./audit-unavailable";
import * as auditDegraded from "./audit-degraded";
import * as auditAvailable from "./audit-available";
import * as auditOldScVersion from "./audit-old-sc-version";
import * as auditNoMessages from "./audit-no-messages";
import * as auditMultipleInstances from "./audit-multiple-instances";
import * as monitoringAvailable from "./monitoring-available";
import * as monitoringUnavailable from "./monitoring-unavailable";
import * as monitoringNoEndpoints from "./monitoring-no-endpoints";
import * as recoverabilityAvailable from "./recoverability-available";
import * as recoverabilityUnavailable from "./recoverability-unavailable";

export interface Scenario {
  name: string;
  description: string;
  setup: (driver: import("../../driver").Driver) => Promise<void>;
}

export const scenarios: Record<string, Scenario> = {
  [defaultScenario.name]: defaultScenario,
  [auditNoInstance.name]: auditNoInstance,
  [auditUnavailable.name]: auditUnavailable,
  [auditDegraded.name]: auditDegraded,
  [auditAvailable.name]: auditAvailable,
  [auditOldScVersion.name]: auditOldScVersion,
  [auditNoMessages.name]: auditNoMessages,
  [auditMultipleInstances.name]: auditMultipleInstances,
  [monitoringAvailable.name]: monitoringAvailable,
  [monitoringUnavailable.name]: monitoringUnavailable,
  [monitoringNoEndpoints.name]: monitoringNoEndpoints,
  [recoverabilityAvailable.name]: recoverabilityAvailable,
  [recoverabilityUnavailable.name]: recoverabilityUnavailable,
};

export function getScenarioNames(): string[] {
  return Object.keys(scenarios);
}

export function getScenario(name: string): Scenario | undefined {
  return scenarios[name];
}
