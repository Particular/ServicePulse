/**
 * Scenario: Audit Old ServiceControl Version
 *
 * ServiceControl version that doesn't support All Messages feature (< 6.6.0).
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=audit-old-sc-version
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Navigate to Messages view
 *   3. All Messages feature should be disabled or show upgrade message
 *   4. Tooltip should indicate minimum version required
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(precondition.scenarioAuditOldScVersion);
