/**
 * Scenario: Monitoring Available
 *
 * Monitoring instance is available with endpoints sending data.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=monitoring-available
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Navigate to Monitoring view
 *   3. Monitoring capability card should show "Available" status
 *   4. Endpoint metrics should be visible
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(precondition.scenarioMonitoringAvailable);
