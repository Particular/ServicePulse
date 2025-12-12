import { RemoteInstance, RemoteInstanceStatus, RemoteInstanceType } from "@/resources/RemoteInstance";
import Message, { MessageStatus } from "@/resources/Message";
import { SetupFactoryOptions } from "../driver";

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
 * Creates a remote error instance with the given configuration
 */
export function createErrorInstance(options: { apiUri?: string; version?: string; status?: RemoteInstanceStatus; retentionPeriod?: string } = {}): RemoteInstance {
  const { apiUri = "http://localhost:33335/api/", version = "6.6.0", status = RemoteInstanceStatus.Online, retentionPeriod = "15.00:00:00" } = options;

  return {
    api_uri: apiUri,
    version,
    status,
    configuration: {
      data_retention: {
        error_retention_period: retentionPeriod,
      },
    },
    cachedInstanceType: RemoteInstanceType.Error,
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

/**
 * Precondition: No audit instances configured (no remote instances at all)
 */
export const hasNoAuditInstances = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
    body: [],
  });
};

/**
 * Precondition: Single audit instance that is online
 */
export const hasAvailableAuditInstance =
  (auditInstance: RemoteInstance = createAuditInstance()) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
      body: [auditInstance],
    });
  };

/**
 * Precondition: Single audit instance that is unavailable
 */
export const hasUnavailableAuditInstance = ({ driver }: SetupFactoryOptions) => {
  const instance = createAuditInstance({ status: RemoteInstanceStatus.Unavailable });
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
    body: [instance],
  });
};

/**
 * Precondition: Multiple audit instances with mixed availability
 */
export const hasPartiallyUnavailableAuditInstances = ({ driver }: SetupFactoryOptions) => {
  const onlineInstance = createAuditInstance({ apiUri: "http://localhost:33334/api/" });
  const offlineInstance = createAuditInstance({ apiUri: "http://localhost:33336/api/", status: RemoteInstanceStatus.Unavailable });
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
    body: [onlineInstance, offlineInstance],
  });
};

/**
 * Precondition: Multiple audit instances all online
 */
export const hasMultipleAvailableAuditInstances = ({ driver }: SetupFactoryOptions) => {
  const instance1 = createAuditInstance({ apiUri: "http://localhost:33334/api/" });
  const instance2 = createAuditInstance({ apiUri: "http://localhost:33336/api/" });
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
    body: [instance1, instance2],
  });
};

/**
 * Precondition: Has successful messages (endpoints configured for auditing)
 */
export const hasSuccessfulMessages =
  (messages: Message[] = [createSuccessfulMessage()]) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpointDynamic(`${window.defaultConfig.service_control_url}messages2/*`, "get", () =>
      Promise.resolve({
        body: messages,
      })
    );
  };

/**
 * Precondition: No successful messages (no endpoints configured for auditing)
 */
export const hasNoSuccessfulMessages = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpointDynamic(`${window.defaultConfig.service_control_url}messages2/*`, "get", () =>
    Promise.resolve({
      body: [],
    })
  );
};

/**
 * ServiceControl version that supports All Messages feature (>= 6.6.0)
 */
export const serviceControlVersionSupportingAllMessages = "6.6.0";

/**
 * ServiceControl version that does NOT support All Messages feature (< 6.6.0)
 */
export const serviceControlVersionNotSupportingAllMessages = "6.5.0";
