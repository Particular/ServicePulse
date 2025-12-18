import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "recoverability-unavailable";
export const description = "Recoverability capability: ServiceControl instance not responding (shows 'Unavailable')";

export async function setup(driver: Driver) {
  // Set up ServiceControl as unavailable FIRST
  await driver.setUp(precondition.hasServiceControlUnavailable);

  // Set up the rest of the app (monitoring still works)
  await driver.setUp(precondition.hasActiveLicense);
  await driver.setUp(precondition.hasLicensingSettingTest());
  // Note: We skip hasServiceControlMainInstance since we want it to fail
  await driver.setUp(precondition.hasServiceControlMonitoringInstance);
  await driver.setUp(precondition.hasUpToDateServiceControl);
  await driver.setUp(precondition.hasUpToDateServicePulse);
  // Note: We skip errorsDefaultHandler since we want the errors endpoint to fail
  await driver.setUp(precondition.hasCustomChecksEmpty);
  await driver.setUp(precondition.hasNoDisconnectedEndpoints);
  await driver.setUp(precondition.hasEventLogItems);
  await driver.setUp(precondition.hasRecoverabilityGroups);
  await driver.setUp(precondition.hasNoHeartbeatsEndpoints);
  await driver.setUp(precondition.hasNoMonitoredEndpoints);
  await driver.setUp(precondition.endpointRecoverabilityByInstanceDefaultHandler);
  await driver.setUp(precondition.endpointRecoverabilityByNameDefaultHandler);
  await driver.setUp(precondition.serviceControlMonitoringOptions);
  await driver.setUp(precondition.serviceControlConfigurationDefaultHandler);
  await driver.setUp(precondition.recoverabilityClassifiers);
  await driver.setUp(precondition.recoverabilityHistoryDefaultHandler);
  await driver.setUp(precondition.recoverabilityEditConfigDefaultHandler);
  await driver.setUp(precondition.archivedGroupsWithClassifierDefaulthandler);
  await driver.setUp(precondition.recoverabilityGroupsWithClassifierDefaulthandler);
  await driver.setUp(precondition.hasLicensingReportAvailable());
  await driver.setUp(precondition.hasLicensingEndpoints());
  await driver.setUp(precondition.hasEndpointSettings([]));
  await driver.setUp(precondition.redirectsDefaultHandler);
  await driver.setUp(precondition.knownQueuesDefaultHandler);
  await driver.setUp(precondition.hasRemoteInstances());
  await driver.setUp(precondition.hasMessages());
  await driver.setUp(precondition.hasMonitoringWithEndpoints());
}
