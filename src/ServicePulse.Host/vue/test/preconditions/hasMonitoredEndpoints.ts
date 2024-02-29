import hasEndpointsResponse from "../mocks/monitored-endpoints.json";
import hasNoEmpoints from "../mocks/monitored-endpoints-empty.json";

import { SetupFactoryOptions } from "../driver";

export const hasMonitoredEndpoints =
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
      body: hasEndpointsResponse,
    });
    return hasEndpointsResponse;
  };

  export const hasNoMonitoredEndpoints =
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
      body: hasNoEmpoints,
    });
    return hasNoEmpoints;
  };

