import { Endpoint } from "@/resources/MonitoringEndpoint";
import { monitoredEndpointTemplate } from "../mocks/monitored-endpoint-template";
import { SetupFactoryOptions } from "../driver";

/**
 * Creates a monitored endpoint with the given name
 */
export function createMonitoredEndpoint(name: string = "TestEndpoint"): Endpoint {
  return {
    ...monitoredEndpointTemplate,
    name,
  };
}

/**
 * Precondition: Monitoring instance is available with monitored endpoints
 * This sets up a successful monitoring scenario
 */
export const hasMonitoringWithEndpoints =
  (endpoints: Endpoint[] = [createMonitoredEndpoint()]) =>
  ({ driver }: SetupFactoryOptions) => {
    const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
    driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints`, {
      body: endpoints,
    });
  };

/**
 * Precondition: Monitoring instance is available but no endpoints are sending data
 */
export const hasMonitoringWithNoEndpoints = ({ driver }: SetupFactoryOptions) => {
  const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
  driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints`, {
    body: [],
  });
};

/**
 * Precondition: Monitoring instance is unavailable (returns error)
 * Note: This simulates an unavailable monitoring instance by not mocking the endpoint,
 * which will cause the connection to fail
 */
export const hasMonitoringUnavailable = ({ driver }: SetupFactoryOptions) => {
  const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
  // Return a 500 error to simulate unavailable monitoring
  driver.mockEndpoint(monitoringInstanceUrl, {
    body: { error: "Service unavailable" },
    status: 500,
  });
  driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints`, {
    body: { error: "Service unavailable" },
    status: 500,
  });
};

/**
 * Precondition: Multiple monitored endpoints
 */
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
