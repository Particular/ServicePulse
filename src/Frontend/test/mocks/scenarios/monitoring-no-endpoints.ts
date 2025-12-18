import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "monitoring-no-endpoints";
export const description = "Monitoring capability: Instance available but no endpoints sending data (shows 'Endpoints Not Configured')";

export async function setup(driver: Driver) {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  // Override with no monitored endpoints
  await driver.setUp(precondition.hasMonitoringWithNoEndpoints);
}
