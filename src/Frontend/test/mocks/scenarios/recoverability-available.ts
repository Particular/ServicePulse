import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "recoverability-available";
export const description = "Recoverability capability: ServiceControl instance available (shows 'Available')";

export async function setup(driver: Driver) {
  await driver.setUp(precondition.serviceControlWithMonitoring);
}
