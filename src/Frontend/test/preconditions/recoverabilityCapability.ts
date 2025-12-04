import { RemoteInstance, RemoteInstanceStatus, RemoteInstanceType } from "@/resources/RemoteInstance";
import { SetupFactoryOptions } from "../driver";

/**
 * Creates a remote error/recoverability instance with the given configuration
 */
export function createRecoverabilityInstance(options: { apiUri?: string; version?: string; status?: RemoteInstanceStatus; retentionPeriod?: string } = {}): RemoteInstance {
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
 * Precondition: Primary ServiceControl instance is available (no secondary error instances)
 * This is the default state set by serviceControlWithMonitoring
 */
export const hasPrimaryErrorInstanceOnly = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
    body: [],
  });
};

/**
 * Precondition: Primary instance available with secondary error instance also available
 */
export const hasSecondaryErrorInstance =
  (errorInstance: RemoteInstance = createRecoverabilityInstance()) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
      body: [errorInstance],
    });
  };

/**
 * Precondition: Primary instance available with secondary error instance unavailable
 * This creates a "Degraded" state
 */
export const hasSecondaryErrorInstanceUnavailable = ({ driver }: SetupFactoryOptions) => {
  const instance = createRecoverabilityInstance({ status: RemoteInstanceStatus.Unavailable });
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
    body: [instance],
  });
};

/**
 * Precondition: Multiple secondary error instances with mixed availability
 */
export const hasMultipleSecondaryErrorInstances =
  (instances: RemoteInstance[] = [createRecoverabilityInstance({ apiUri: "http://localhost:33335/api/" }), createRecoverabilityInstance({ apiUri: "http://localhost:33336/api/" })]) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
      body: instances,
    });
  };

/**
 * Precondition: Multiple secondary error instances with one unavailable (degraded state)
 */
export const hasMultipleSecondaryErrorInstancesPartiallyUnavailable = ({ driver }: SetupFactoryOptions) => {
  const instances = [createRecoverabilityInstance({ apiUri: "http://localhost:33335/api/", status: RemoteInstanceStatus.Online }), createRecoverabilityInstance({ apiUri: "http://localhost:33336/api/", status: RemoteInstanceStatus.Unavailable })];
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
    body: instances,
  });
};
