import { RemoteInstance, RemoteInstanceStatus, RemoteInstanceType } from "@/resources/RemoteInstance";
import Message, { MessageStatus } from "@/resources/Message";
import { Endpoint } from "@/resources/MonitoringEndpoint";
import { monitoredEndpointTemplate } from "../mocks/monitored-endpoint-template";
import { SetupFactoryOptions } from "../driver";
import * as precondition from ".";

// =============================================================================
// AUDIT CAPABILITY
// =============================================================================

/**
 * Creates a remote audit instance with the given configuration
 */
export function createAuditInstance(options: { apiUri?: string; version?: string; status?: RemoteInstanceStatus; retentionPeriod?: string } = {}): RemoteInstance {
  const { apiUri = "http://localhost:33334/api/", version = "6.6.0", status = RemoteInstanceStatus.Online, retentionPeriod = "7.00:00:00" } = options;

  return {
    api_uri: apiUri,
    version,
    status,
    configuration: {
      data_retention: {
        audit_retention_period: retentionPeriod,
      },
    },
    cachedInstanceType: RemoteInstanceType.Audit,
  };
}

/**
 * Creates a successful message for testing
 */
export function createSuccessfulMessage(id: string = "msg-1"): Message {
  return {
    id,
    message_id: id,
    message_type: "TestMessage",
    sending_endpoint: { name: "Sender", host_id: "host-1", host: "localhost" },
    receiving_endpoint: { name: "Receiver", host_id: "host-2", host: "localhost" },
    time_sent: new Date().toISOString(),
    processed_at: new Date().toISOString(),
    critical_time: "00:00:00.1234567",
    processing_time: "00:00:00.0123456",
    delivery_time: "00:00:00.0012345",
    is_system_message: false,
    conversation_id: "conv-1",
    headers: [],
    status: MessageStatus.Successful,
    message_intent: "send" as never,
    body_url: "",
    body_size: 100,
    instance_id: "instance-1",
  };
}

/** ServiceControl version that supports All Messages feature (>= 6.6.0) */
export const serviceControlVersionSupportingAllMessages = "6.6.0";

/** ServiceControl version that does NOT support All Messages feature (< 6.6.0) */
export const serviceControlVersionNotSupportingAllMessages = "6.5.0";

// Audit preconditions

/** Precondition: No audit instances configured */
export const hasNoAuditInstances = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
    body: [],
  });
};

/** Precondition: Single audit instance that is online */
export const hasAvailableAuditInstance =
  (auditInstance: RemoteInstance = createAuditInstance()) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
      body: [auditInstance],
    });
  };

/** Precondition: Single audit instance that is unavailable */
export const hasUnavailableAuditInstance = ({ driver }: SetupFactoryOptions) => {
  const instance = createAuditInstance({ status: RemoteInstanceStatus.Unavailable });
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
    body: [instance],
  });
};

/** Precondition: Multiple audit instances with mixed availability */
export const hasPartiallyUnavailableAuditInstances = ({ driver }: SetupFactoryOptions) => {
  const onlineInstance = createAuditInstance({ apiUri: "http://localhost:33334/api/" });
  const offlineInstance = createAuditInstance({ apiUri: "http://localhost:33336/api/", status: RemoteInstanceStatus.Unavailable });
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
    body: [onlineInstance, offlineInstance],
  });
};

/** Precondition: Multiple audit instances all online */
export const hasMultipleAvailableAuditInstances = ({ driver }: SetupFactoryOptions) => {
  const instance1 = createAuditInstance({ apiUri: "http://localhost:33334/api/" });
  const instance2 = createAuditInstance({ apiUri: "http://localhost:33336/api/" });
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
    body: [instance1, instance2],
  });
};

/** Precondition: Has successful messages (endpoints configured for auditing) */
export const hasSuccessfulMessages =
  (messages: Message[] = [createSuccessfulMessage()]) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpointDynamic(`${window.defaultConfig.service_control_url}messages2/*`, "get", () =>
      Promise.resolve({
        body: messages,
      })
    );
  };

/** Precondition: No successful messages (no endpoints configured for auditing) */
export const hasNoSuccessfulMessages = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpointDynamic(`${window.defaultConfig.service_control_url}messages2/*`, "get", () =>
    Promise.resolve({
      body: [],
    })
  );
};

// =============================================================================
// MONITORING CAPABILITY
// =============================================================================

/**
 * Creates a monitored endpoint with the given name
 */
export function createMonitoredEndpoint(name: string = "TestEndpoint"): Endpoint {
  return {
    ...monitoredEndpointTemplate,
    name,
  };
}

/** Precondition: Monitoring instance is available with monitored endpoints */
export const hasMonitoringWithEndpoints =
  (endpoints: Endpoint[] = [createMonitoredEndpoint()]) =>
  ({ driver }: SetupFactoryOptions) => {
    const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
    driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints`, {
      body: endpoints,
    });
  };

/** Precondition: Monitoring instance is available but no endpoints are sending data */
export const hasMonitoringWithNoEndpoints = ({ driver }: SetupFactoryOptions) => {
  const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
  driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints`, {
    body: [],
  });
};

/** Precondition: Monitoring instance is unavailable (returns error) */
export const hasMonitoringUnavailable = ({ driver }: SetupFactoryOptions) => {
  const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
  driver.mockEndpoint(monitoringInstanceUrl, {
    body: { error: "Service unavailable" },
    status: 500,
  });
  driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints`, {
    body: { error: "Service unavailable" },
    status: 500,
  });
};

/** Precondition: Multiple monitored endpoints */
export const hasMultipleMonitoredEndpoints =
  (count: number = 3) =>
  ({ driver }: SetupFactoryOptions) => {
    const endpoints: Endpoint[] = [];
    for (let i = 0; i < count; i++) {
      endpoints.push(createMonitoredEndpoint(`Endpoint${i + 1}`));
    }
    const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
    driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints`, {
      body: endpoints,
    });
  };

// =============================================================================
// RECOVERABILITY CAPABILITY
// =============================================================================

/** Precondition: ServiceControl instance is unavailable */
export const hasServiceControlUnavailable = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}errors*`, {
    body: { error: "Service unavailable" },
    status: 500,
  });
};

// =============================================================================
// COMPLETE SCENARIOS
// Use these for both manual mock scenarios and automated tests
// =============================================================================

/**
 * Scenario: Audit Available
 * Audit instance is online with successful messages
 */
export const scenarioAuditAvailable = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(hasAvailableAuditInstance());
  await driver.setUp(hasSuccessfulMessages());
};

/**
 * Scenario: Audit Unavailable
 * Audit instance is configured but not responding
 */
export const scenarioAuditUnavailable = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(hasUnavailableAuditInstance);
  await driver.setUp(hasNoSuccessfulMessages);
};

/**
 * Scenario: Audit Degraded
 * Multiple audit instances with mixed availability
 */
export const scenarioAuditDegraded = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(hasPartiallyUnavailableAuditInstances);
  await driver.setUp(hasSuccessfulMessages());
};

/**
 * Scenario: Audit Not Configured
 * No audit instances configured (shows "Get Started")
 */
export const scenarioAuditNotConfigured = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(hasNoAuditInstances);
  await driver.setUp(hasNoSuccessfulMessages);
};

/**
 * Scenario: Audit No Messages
 * Audit instance is available but no messages have been processed
 */
export const scenarioAuditNoMessages = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(hasAvailableAuditInstance());
  await driver.setUp(hasNoSuccessfulMessages);
};

/**
 * Scenario: Audit Multiple Instances
 * Multiple audit instances, all available
 */
export const scenarioAuditMultipleInstances = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(hasMultipleAvailableAuditInstances);
  await driver.setUp(hasSuccessfulMessages());
};

/**
 * Scenario: Audit Old SC Version
 * ServiceControl version that doesn't support All Messages feature
 */
export const scenarioAuditOldScVersion = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.hasActiveLicense);
  await driver.setUp(precondition.hasLicensingSettingTest());
  await driver.setUp(precondition.hasServiceControlMainInstance(serviceControlVersionNotSupportingAllMessages));
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
  // Audit instance with old version to show correct version in tooltip
  const oldVersionAuditInstance = createAuditInstance({ version: serviceControlVersionNotSupportingAllMessages });
  await driver.setUp(hasAvailableAuditInstance(oldVersionAuditInstance));
  await driver.setUp(hasSuccessfulMessages());
};

/**
 * Scenario: Monitoring Available
 * Monitoring instance is available with endpoints sending data
 */
export const scenarioMonitoringAvailable = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(hasMonitoringWithEndpoints());
};

/**
 * Scenario: Monitoring Unavailable
 * Monitoring instance is configured but not responding
 */
export const scenarioMonitoringUnavailable = async ({ driver }: SetupFactoryOptions) => {
  // Set up monitoring as unavailable FIRST, before the general setup
  await driver.setUp(hasMonitoringUnavailable);
  // Then set up the rest (without the monitoring instance mock)
  await driver.setUp(precondition.hasActiveLicense);
  await driver.setUp(precondition.hasLicensingSettingTest());
  await driver.setUp(precondition.hasServiceControlMainInstance());
  await driver.setUp(precondition.hasUpToDateServiceControl);
  await driver.setUp(precondition.hasUpToDateServicePulse);
  await driver.setUp(precondition.errorsDefaultHandler);
  await driver.setUp(precondition.hasCustomChecksEmpty);
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
};

/**
 * Scenario: Monitoring No Endpoints
 * Monitoring instance is available but no endpoints are sending data
 */
export const scenarioMonitoringNoEndpoints = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(hasMonitoringWithNoEndpoints);
};

/**
 * Scenario: Recoverability Available
 * ServiceControl instance is available (default state)
 */
export const scenarioRecoverabilityAvailable = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
};

/**
 * Scenario: Recoverability Unavailable
 * ServiceControl instance is not responding
 */
export const scenarioRecoverabilityUnavailable = async ({ driver }: SetupFactoryOptions) => {
  // Set up ServiceControl as unavailable FIRST
  await driver.setUp(hasServiceControlUnavailable);
  // Set up the rest (monitoring still works)
  await driver.setUp(precondition.hasActiveLicense);
  await driver.setUp(precondition.hasLicensingSettingTest());
  await driver.setUp(precondition.hasServiceControlMonitoringInstance);
  await driver.setUp(precondition.hasUpToDateServiceControl);
  await driver.setUp(precondition.hasUpToDateServicePulse);
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
  await driver.setUp(hasMonitoringWithEndpoints());
};
