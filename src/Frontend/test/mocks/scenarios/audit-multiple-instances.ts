import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "audit-multiple-instances";
export const description = "Audit capability: Multiple audit instances all available (shows numbered indicators)";

export async function setup(driver: Driver) {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  // Override with multiple available audit instances
  await driver.setUp(precondition.hasMultipleAvailableAuditInstances);
  await driver.setUp(precondition.hasSuccessfulMessages());
}
