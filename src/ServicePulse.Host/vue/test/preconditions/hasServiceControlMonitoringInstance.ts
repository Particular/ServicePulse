import content from "../mocks/service-control-monitoring-instance.json";
import {SetupFactoryOptions} from '../driver'

export const hasServiceControlMonitoringInstance = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33633`, {
    body: content,
    headers: {'X-Particular-Version':'5.0.4'}  
  });
  return content;
};
