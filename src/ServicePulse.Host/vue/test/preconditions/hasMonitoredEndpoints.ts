import hasEndpointsResponse from "../mocks/monitored-endpoints.json";
import hasNoEndpoints from "../mocks/monitored-endpoints-empty.json";
import monitoredEndpointTemplate from "../mocks/monitored-endpoint-template";

import { SetupFactoryOptions } from "../driver";

export const hasMonitoredEndpoints = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
    body: hasEndpointsResponse,
  });
  return hasEndpointsResponse;
};

export const hasNoMonitoredEndpoints = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
    body: hasNoEndpoints,
  });
  return hasNoEndpoints;
};

export const monitoredEndpointsNamed =
  (endpointNames: string[]) =>
  ({ driver }: SetupFactoryOptions) => {
    const response = endpointNames.map((name) => {
      return { ...monitoredEndpointTemplate, name: name };
    });

    driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
      body: response,
    });
    return response;
  };
