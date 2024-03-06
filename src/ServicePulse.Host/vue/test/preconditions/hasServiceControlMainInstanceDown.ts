import content from "../mocks/service-control-main-instance.json";
import {SetupFactoryOptions} from '../driver'

export const hasServiceControlMainInstanceDown = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33333/api/`, {
    body: content,      
    headers: {'X-Particular-Version':'5.0.4'}  
  });
  return content;
};
