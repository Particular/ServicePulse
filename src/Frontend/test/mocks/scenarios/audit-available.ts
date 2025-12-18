import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "audit-available";
export const description = "Audit capability: Audit instance available with successful messages (shows 'Available')";

export async function setup(driver: Driver) {
  // Need full setup with SC version >= 6.6.0 for All Messages support
  await driver.setUp(precondition.hasActiveLicense);
  await driver.setUp(precondition.hasLicensingSettingTest());
  await driver.setUp(precondition.hasServiceControlMainInstance(precondition.serviceControlVersionSupportingAllMessages));
  await driver.setUp(precondition.hasServiceControlMonitoringInstance);
  await driver.setUp(precondition.hasUpToDateServiceControl);
  await driver.setUp(precondition.hasUpToDateServicePulse);
  await driver.setUp(precondition.errorsDefaultHandler);
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
  // Audit instance is available and has successful messages
  await driver.setUp(precondition.hasAvailableAuditInstance());
  await driver.setUp(precondition.hasSuccessfulMessages());
}
