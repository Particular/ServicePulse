/**
 * Scenario: Audit Available
 *
 * Audit instance is online with successful messages.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=audit-available
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Navigate to Messages view
 *   3. Audit capability card should show "Available" status
 *   4. Messages should be visible in the list
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(precondition.scenarioAuditAvailable);
