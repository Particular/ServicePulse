import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "audit-unavailable";
export const description = "Audit capability: Audit instance configured but unavailable (shows 'Unavailable')";

export async function setup(driver: Driver) {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  // Override with unavailable audit instance
  await driver.setUp(precondition.hasUnavailableAuditInstance);
  await driver.setUp(precondition.hasNoSuccessfulMessages);
}
