import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "audit-old-sc-version";
export const description = "Audit capability: Old ServiceControl version (< 6.6.0) - All Messages not supported";

export async function setup(driver: Driver) {
  // Set up with ServiceControl version < 6.6.0 which does NOT support "All Messages" feature
  await driver.setUp(precondition.hasActiveLicense);
  await driver.setUp(precondition.hasLicensingSettingTest());
  await driver.setUp(precondition.hasServiceControlMainInstance(precondition.serviceControlVersionNotSupportingAllMessages));
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
  // Audit instance is available and has successful messages, but SC version doesn't support All Messages
  // Pass an audit instance with the old version to show correct version in tooltip
  const oldVersionAuditInstance = precondition.createAuditInstance({ version: precondition.serviceControlVersionNotSupportingAllMessages });
  await driver.setUp(precondition.hasAvailableAuditInstance(oldVersionAuditInstance));
  await driver.setUp(precondition.hasSuccessfulMessages());
}
