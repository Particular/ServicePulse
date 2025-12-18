import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "audit-degraded";
export const description = "Audit capability: Multiple audit instances with mixed availability (shows 'Degraded')";

export async function setup(driver: Driver) {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  // Override with partially unavailable audit instances
  await driver.setUp(precondition.hasPartiallyUnavailableAuditInstances);
  await driver.setUp(precondition.hasSuccessfulMessages());
}
