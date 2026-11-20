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
 *   5. Opening a message should show its details, and the Sequence Diagram tab should show the conversation
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(async ({ driver }) => {
  await driver.setUp(precondition.scenarioAuditAvailable);
  const conversation = precondition.createMessageConversation();
  await driver.setUp(precondition.hasSuccessfulMessages(conversation));
  await driver.setUp(precondition.hasMessageConversation(conversation));
});
