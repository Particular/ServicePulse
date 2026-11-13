/**
 * Scenario: Trial License
 *
 * ServiceControl and Monitoring are available and the license is a valid trial that is not close to expiring.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=trial-license
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Every page should show the "Trial license, non-production use only" bar at the bottom
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";
import { LicenseStatus } from "@/resources/LicenseInfo";
import { createDateWithDayOffset } from "@/composables/formatter";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(async ({ driver }) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  const activeLicense = precondition.hasActiveLicense({ driver });
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}license`, {
    body: {
      ...activeLicense,
      license_type: "Trial",
      trial_license: true,
      license_status: LicenseStatus.Valid,
      expiration_date: createDateWithDayOffset(60).toISOString(),
    },
  });
});
