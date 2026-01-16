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
  "auth-disabled": () => import("./authentication/auth-disabled"),
  "auth-enabled": () => import("./authentication/auth-enabled"),
  "auth-authenticated": () => import("./authentication/auth-authenticated"),
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
