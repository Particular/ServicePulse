import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "audit-no-messages";
export const description = "Audit capability: Audit instance available but no successful messages (shows 'Endpoints Not Configured')";

export async function setup(driver: Driver) {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  // Override with available audit instance but no messages
  await driver.setUp(precondition.hasAvailableAuditInstance());
  await driver.setUp(precondition.hasNoSuccessfulMessages);
}
