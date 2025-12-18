import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "monitoring-available";
export const description = "Monitoring capability: Instance available with endpoints sending data (shows 'Available')";

export async function setup(driver: Driver) {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  // Override with monitored endpoints that are sending data
  await driver.setUp(precondition.hasMonitoringWithEndpoints());
}
