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
 *   5. Click a failed message → Body tab → toggle "Hex" to see hex view
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(async ({ driver }) => {
  await driver.setUp(precondition.scenarioRecoverabilityAvailable);

  // Add a failed message with body so the Body tab (and Hex view) can be tested
  // Note: withGroupId and withMessageId must match because the mock's body_url
  // uses the groupId but the body endpoint handler uses the messageId
  await driver.setUp(
    precondition.hasFailedMessage({
      withGroupId: "hex-test-1",
      withMessageId: "hex-test-1",
      withContentType: "application/json",
      withBody: { orderId: 12345, customerName: "Alice", amount: 99.95, shipped: false, notes: "express delivery" },
    })
  );
});
