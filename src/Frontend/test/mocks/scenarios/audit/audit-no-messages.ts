/**
 * Scenario: Audit No Messages
 *
 * Audit instance is available but no messages have been processed yet.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=audit-no-messages
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Navigate to Messages view
 *   3. Audit capability card should show "Available" status
 *   4. Empty state message should indicate no messages found
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(precondition.scenarioAuditNoMessages);
