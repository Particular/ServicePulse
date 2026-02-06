/**
 * Mock Scenarios Index
 *
 * This file dynamically loads the appropriate mock scenario based on
 * the VITE_MOCK_SCENARIO environment variable.
 *
 * Usage:
 *   VITE_MOCK_SCENARIO=auth-disabled npm run dev:mocks
 *
 * Or add to package.json scripts:
 *   "dev:mocks:auth-disabled": "cross-env NODE_ENV=dev-mocks VITE_MOCK_SCENARIO=auth-disabled vite"
 */

type ScenarioModule = {
  worker: import("msw/browser").SetupWorker;
  setupComplete?: Promise<void>;
};

const scenarios: Record<string, () => Promise<ScenarioModule>> = {
  default: () => import("../browser"),
  // Authentication scenarios
  "auth-disabled": () => import("./authentication/auth-disabled"),
  "auth-enabled": () => import("./authentication/auth-enabled"),
  "auth-authenticated": () => import("./authentication/auth-authenticated"),
  // Audit scenarios
  "audit-available": () => import("./audit/audit-available"),
  "audit-unavailable": () => import("./audit/audit-unavailable"),
  "audit-degraded": () => import("./audit/audit-degraded"),
  "audit-no-instance": () => import("./audit/audit-no-instance"),
  "audit-no-messages": () => import("./audit/audit-no-messages"),
  "audit-old-sc-version": () => import("./audit/audit-old-sc-version"),
  "audit-multiple-instances": () => import("./audit/audit-multiple-instances"),
  // Monitoring scenarios
  "monitoring-available": () => import("./monitoring/monitoring-available"),
  "monitoring-unavailable": () => import("./monitoring/monitoring-unavailable"),
  "monitoring-no-endpoints": () => import("./monitoring/monitoring-no-endpoints"),
  // Recoverability scenarios
  "recoverability-available": () => import("./recoverability/recoverability-available"),
  "recoverability-unavailable": () => import("./recoverability/recoverability-unavailable"),
};

export async function loadScenario(): Promise<ScenarioModule> {
  // Trim to handle Windows CMD whitespace issues (e.g., "set VAR=value && cmd" includes trailing space)
  const scenarioName = import.meta.env.VITE_MOCK_SCENARIO?.trim() || "default";
  const loader = scenarios[scenarioName];

  if (!loader) {
    console.warn(`Unknown mock scenario: "${scenarioName}", falling back to default. Available: ${Object.keys(scenarios).join(", ")}`);
    const module = await scenarios.default();
    if (module.setupComplete) await module.setupComplete;
    return module;
  }

  console.log(`Loading mock scenario: ${scenarioName}`);
  const module = await loader();

  // Wait for setup to complete before returning
  if (module.setupComplete) {
    await module.setupComplete;
  }

  return module;
}
