import serviceControlMonitoringInstanceApiResponse from "../mocks/service-control-monitoring-instance.json";
import {SetupFactoryOptions} from '../driver'

export const hasServiceControlMonitoringInstance = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33633`, {
    body: serviceControlMonitoringInstanceApiResponse,
  });
  return serviceControlMonitoringInstanceApiResponse;
};
