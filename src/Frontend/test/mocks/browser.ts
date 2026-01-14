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

const { worker, driver } = createScenario();
export { worker };

export const setupComplete = (async () => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
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
