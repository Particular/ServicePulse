import content from "../mocks/monitored-endpoints.json";
import {SetupFactoryOptions} from '../driver'

export const hasMonitoredEndpoints = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33633/monitored-endpoints`, {
    body: content,
  });
  return content;
};
