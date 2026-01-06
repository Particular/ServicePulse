/**
 * Mock Scenarios Index
 *
 * This file defines all mock scenarios for manual testing with MSW.
 * Scenarios are loaded based on the VITE_MOCK_SCENARIO environment variable.
 *
 * Usage:
 *   VITE_MOCK_SCENARIO=audit-available npm run dev:mocks
 *
 * Or on Windows:
 *   set VITE_MOCK_SCENARIO=audit-available && npm run dev:mocks
 */
import { SetupWorker } from "msw/browser";
import { createScenario } from "./scenario-helper";
import * as precondition from "../../preconditions";

type ScenarioModule = {
  worker: SetupWorker;
  setupComplete: Promise<void>;
};

type ScenarioFactory = () => ScenarioModule;

/**
 * Creates a simple scenario that runs a single precondition.
 */
function makeScenario(scenarioFn: Parameters<ReturnType<typeof createScenario>["runScenario"]>[0]): ScenarioFactory {
  return () => {
    const { worker, runScenario } = createScenario();
    return { worker, setupComplete: runScenario(scenarioFn) };
  };
}

const scenarios: Record<string, ScenarioFactory> = {
  // Audit scenarios
  "audit-available": makeScenario(precondition.scenarioAuditAvailable),
  "audit-unavailable": makeScenario(precondition.scenarioAuditUnavailable),
  "audit-degraded": makeScenario(precondition.scenarioAuditDegraded),
  "audit-no-instance": makeScenario(precondition.scenarioAuditNotConfigured),
  "audit-no-messages": makeScenario(precondition.scenarioAuditNoMessages),
  "audit-old-sc-version": makeScenario(precondition.scenarioAuditOldScVersion),
  "audit-multiple-instances": makeScenario(precondition.scenarioAuditMultipleInstances),

  // Monitoring scenarios
  "monitoring-available": makeScenario(precondition.scenarioMonitoringAvailable),
  "monitoring-unavailable": makeScenario(precondition.scenarioMonitoringUnavailable),
  "monitoring-no-endpoints": makeScenario(precondition.scenarioMonitoringNoEndpoints),

  // Recoverability scenarios
  "recoverability-available": makeScenario(precondition.scenarioRecoverabilityAvailable),
  "recoverability-unavailable": makeScenario(precondition.scenarioRecoverabilityUnavailable),
};

export function getScenarioNames(): string[] {
  return ["browser", ...Object.keys(scenarios)];
}

async function loadBrowserScenario(): Promise<ScenarioModule> {
  const browser = await import("../browser");
  await browser.setupComplete;
  return browser;
}

export async function loadScenario(): Promise<ScenarioModule> {
  // Trim to handle Windows CMD whitespace issues (e.g., "set VAR=value && cmd" includes trailing space)
  const scenarioName = import.meta.env.VITE_MOCK_SCENARIO?.trim() || "browser";

  // Default browser scenario is in a separate file
  if (scenarioName === "browser" || !scenarioName) {
    return loadBrowserScenario();
  }

  const factory = scenarios[scenarioName];

  if (!factory) {
    console.warn(`Unknown mock scenario: "${scenarioName}", falling back to browser. Available: browser, ${Object.keys(scenarios).join(", ")}`);
    return loadBrowserScenario();
  }

  console.log(`Loading mock scenario: ${scenarioName}`);
  const module = factory();
  await module.setupComplete;

  return module;
}
