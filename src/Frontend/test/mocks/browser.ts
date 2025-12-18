import { setupWorker } from "msw/browser";
import { Driver } from "../driver";
import { makeMockEndpoint, makeMockEndpointDynamic } from "../mock-endpoint";
import { scenarios, getScenarioNames } from "./scenarios";

export const worker = setupWorker();
const mockEndpoint = makeMockEndpoint({ mockServer: worker });
const mockEndpointDynamic = makeMockEndpointDynamic({ mockServer: worker });

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

(async () => {
  const scenarioName = getScenarioFromUrl();
  const scenario = scenarios[scenarioName];

  if (!scenario) {
    console.error(`❌ Unknown scenario: "${scenarioName}"`);
    console.log(`Available scenarios: ${getScenarioNames().join(", ")}`);
    // Fall back to default
    await scenarios["default"].setup(driver);
  } else {
    console.log(`%c🎭 Loading scenario: ${scenarioName}`, "font-weight: bold; font-size: 14px; color: #2196F3;");
    console.log(`%c${scenario.description}`, "color: #666; font-style: italic;");
    await scenario.setup(driver);
  }

  logAvailableScenarios();
})();
