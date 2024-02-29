import content1 from "../mocks/monitored-endpoints1.json";
import content2 from "../mocks/monitored-endpoints2.json";
import content3 from "../mocks/monitored-endpoints3.json";
import { SetupFactoryOptions } from "../driver";

export const hasMonitoredEndpoints1 =
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
      body: content1,
    });
    return content1;
  };

  export const hasMonitoredEndpoints2 =
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
      body: content2,
    });
    return content2;
  };

  export const hasMonitoredEndpoints3 =
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
      body: content3,
    });
    return content3;
  };
