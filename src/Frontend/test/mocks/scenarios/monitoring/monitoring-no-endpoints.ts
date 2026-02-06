/**
 * Scenario: Monitoring No Endpoints
 *
 * Monitoring instance is available but no endpoints are sending data.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=monitoring-no-endpoints
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Navigate to Monitoring view
 *   3. Monitoring capability card should show "Available" status
 *   4. Empty state should indicate no endpoints are reporting
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(precondition.scenarioMonitoringNoEndpoints);
