/**
 * Scenario: Saga timeouts
 *
 * ServiceControl tracks pending, overdue, triggered, canceled, and unknown saga timeouts.
 * Operator actions are applied by a simulated endpoint three seconds after they are requested.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=timeouts
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open the Timeouts menu item; the badge shows the overdue count
 *   2. Switch between the Pending, Overdue, and All tabs and use the filters
 *   3. Open a timeout and reschedule, trigger, or cancel it
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = (async () => {
  await runScenario(precondition.serviceControlWithMonitoring);
  await runScenario(precondition.hasSagaTimeouts());
})();
