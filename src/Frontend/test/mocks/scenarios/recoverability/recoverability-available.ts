/**
 * Scenario: Recoverability Available
 *
 * ServiceControl instance is available (default state).
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=recoverability-available
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Navigate to Failed Messages view
 *   3. Recoverability capability card should show "Available" status
 *   4. Failed message recovery features should work
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(precondition.scenarioRecoverabilityAvailable);
