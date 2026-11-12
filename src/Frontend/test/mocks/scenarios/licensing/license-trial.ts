/**
 * Scenario: Trial license
 *
 * A valid trial license that expires in 10 days, with the default dev-mocks data.
 * The sidebar shows the trial-license notice.
 *
 * Usage:
 *   VITE_MOCK_SCENARIO=license-trial npm run dev:mocks
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";
import { LicenseType } from "@/resources/LicenseInfo";
import { withDefaultDataAndLicense } from "./license-shared";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(withDefaultDataAndLicense(precondition.hasExpiringLicense(LicenseType.Trial)));
