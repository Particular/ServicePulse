import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "monitoring-unavailable";
export const description = "Monitoring capability: Instance configured but not responding (shows 'Unavailable')";

export async function setup(driver: Driver) {
  // Set up monitoring as unavailable FIRST, before the general setup
  // This ensures the monitoring endpoints return errors
  await driver.setUp(precondition.hasMonitoringUnavailable);

  // Then set up the rest of ServiceControl (but monitoring is already mocked to fail)
  await driver.setUp(precondition.hasActiveLicense);
  await driver.setUp(precondition.hasLicensingSettingTest());
  await driver.setUp(precondition.hasServiceControlMainInstance());
  // Note: We skip hasServiceControlMonitoringInstance since we want monitoring to fail
  await driver.setUp(precondition.hasUpToDateServiceControl);
  await driver.setUp(precondition.hasUpToDateServicePulse);
  await driver.setUp(precondition.errorsDefaultHandler);
  await driver.setUp(precondition.hasCustomChecksEmpty);
  // Note: We skip hasNoDisconnectedEndpoints since we want this to fail
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
}
