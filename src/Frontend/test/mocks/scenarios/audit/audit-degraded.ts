/**
 * Scenario: Audit Degraded
 *
 * Multiple audit instances with mixed availability (some online, some offline).
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=audit-degraded
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Navigate to Messages view
 *   3. Audit capability card should show "Degraded" status
 *   4. Warning should indicate partial availability
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(precondition.scenarioAuditDegraded);
