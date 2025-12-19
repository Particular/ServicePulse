/**
 * Default Browser Scenario
 *
 * Default scenario with monitoring, custom checks, and a failed message.
 * This is the scenario loaded when no VITE_MOCK_SCENARIO is specified.
 *
 * Usage:
 *   npm run dev:mocks
 */
import { createScenario } from "./scenarios/scenario-helper";
import * as precondition from "../preconditions";

const makeDriver = (): Driver => ({
  goTo() {
    throw new Error("Not implemented");
  },
  mockEndpoint,
  mockEndpointDynamic,
  setUp(factory) {
    return factory({ driver: this });
  },
  disposeApp() {
    throw new Error("Not implemented");
  },
});

const driver = makeDriver();

function getScenarioFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("scenario") || "default";
}

function logAvailableScenarios() {
  console.log("%c📋 Available Mock Scenarios:", "font-weight: bold; font-size: 14px; color: #4CAF50;");
  console.log("%cUse ?scenario=<name> in the URL to switch scenarios", "color: #888; font-style: italic;");
  console.log("");

  for (const [name, scenario] of Object.entries(scenarios)) {
    const url = `${window.location.origin}${window.location.pathname}?scenario=${name}`;
    console.log(`  %c${name}%c - ${scenario.description}`, "color: #2196F3; font-weight: bold;", "color: #666;");
    console.log(`    %c${url}`, "color: #888; font-size: 11px;");
  }
}

// Export a promise that resolves when all mock handlers are registered
export const setupComplete = (async () => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  //override the default mocked endpoints with a custom list
  await driver.setUp(precondition.hasCustomChecks(3, 2));

  await driver.setUp(
    precondition.monitoredEndpointsNamed([
      "Universe.Solarsystem.Mercury.Endpoint1",
      "Universe.Solarsystem.Mercury.Endpoint2",
      "Universe.Solarsystem.Venus.Endpoint3",
      "Universe.Solarsystem.Venus.Endpoint4",
      "Universe.Solarsystem.Earth.Endpoint5",
      "Universe.Solarsystem.Earth.Endpoint6",
    ])
  );
  await driver.setUp(
    precondition.hasFailedMessage({
      withGroupId: "81dca64e-76fc-e1c3-11a2-3069f51c58c8",
      withMessageId: "40134401-bab9-41aa-9acb-b19c0066f22d",
      withContentType: "application/json",
      withBody: { Index: 0, Data: "" },
    })
  );
})();
