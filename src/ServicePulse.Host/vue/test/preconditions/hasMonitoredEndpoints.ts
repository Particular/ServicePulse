import hasEndpointsResponse from "../mocks/monitored-endpoints.json";
import hasNoEmpoints from "../mocks/monitored-endpoints-empty.json";
import monitoredEndpointTemplate from "../mocks/monitored-endpoint-template";

import { SetupFactoryOptions } from "../driver";
import { Endpoint } from "@/resources/Endpoint";

export const hasMonitoredEndpoints = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
    body: hasEndpointsResponse,
  });
  return hasEndpointsResponse;
};

export const hasNoMonitoredEndpoints = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
    body: hasNoEmpoints,
  });
  return hasNoEmpoints;
};

export const withEndpointsNamed =
  (endpointNames: string[]) =>
  ({ driver }: SetupFactoryOptions) => {
    const reponse = endpointNames.map((e) => {
      const endpoint = monitoredEndpointTemplate;
      endpoint.name = e;
      return endpoint;
    });

    driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
      body: reponse,
    });
    return reponse;
  };
