/**
 * Scenario: Recoverability Unavailable
 *
 * ServiceControl instance is not responding.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=recoverability-unavailable
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Navigate to Failed Messages view
 *   3. Recoverability capability card should show "Unavailable" status
 *   4. Error message should indicate ServiceControl is not responding
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(precondition.scenarioRecoverabilityUnavailable);
