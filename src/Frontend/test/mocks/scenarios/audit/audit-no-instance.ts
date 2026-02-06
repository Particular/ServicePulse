/**
 * Scenario: Audit Not Configured
 *
 * No audit instances configured (shows "Get Started" guidance).
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=audit-no-instance
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Navigate to Messages view
 *   3. Audit capability card should show "Get Started" action
 *   4. Link to setup documentation should be displayed
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(precondition.scenarioAuditNotConfigured);
