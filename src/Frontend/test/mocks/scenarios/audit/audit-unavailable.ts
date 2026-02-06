/**
 * Scenario: Audit Unavailable
 *
 * Audit instance is configured but not responding.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=audit-unavailable
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Navigate to Messages view
 *   3. Audit capability card should show "Unavailable" status
 *   4. Error message should indicate the instance is not responding
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(precondition.scenarioAuditUnavailable);
