import serviceControlMainInstanceApiResponse from "../mocks/service-control-main-instance.json";
import {SetupFactoryOptions} from '../driver'

export const hasServiceControlMainInstance = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33333/api/`, {
    body: serviceControlMainInstanceApiResponse,
  });
  return serviceControlMainInstanceApiResponse;
};
