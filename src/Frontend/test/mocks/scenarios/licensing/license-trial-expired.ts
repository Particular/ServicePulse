/**
 * Scenario: Expired trial license
 *
 * A trial license that expired 10 days ago, with the default dev-mocks data.
 * License warnings appear on Configuration and in the license notifications.
 *
 * Usage:
 *   VITE_MOCK_SCENARIO=license-trial-expired npm run dev:mocks
 */
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";
import { LicenseType } from "@/resources/LicenseInfo";
import { withDefaultDataAndLicense } from "./license-shared";

const { worker, runScenario } = createScenario();

export { worker };
export const setupComplete = runScenario(withDefaultDataAndLicense(precondition.hasExpiredLicense(LicenseType.Trial)));
