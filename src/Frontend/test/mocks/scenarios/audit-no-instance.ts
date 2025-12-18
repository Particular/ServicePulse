import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "audit-no-instance";
export const description = "Audit capability: No audit instance configured (shows 'Get Started')";

export async function setup(driver: Driver) {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  // Override with no audit instances
  await driver.setUp(precondition.hasNoAuditInstances);
  await driver.setUp(precondition.hasNoSuccessfulMessages);
}
