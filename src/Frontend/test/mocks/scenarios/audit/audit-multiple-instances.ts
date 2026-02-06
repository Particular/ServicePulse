/**
 * Scenario: Audit Multiple Instances
 *
 * Multiple audit instances, all available.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=audit-multiple-instances
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Navigate to Messages view
 *   3. Audit capability card should show "Available" status
 *   4. Messages from all instances should be aggregated
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(precondition.scenarioAuditMultipleInstances);
