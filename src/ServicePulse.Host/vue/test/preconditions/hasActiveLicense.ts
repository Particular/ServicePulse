import content from "../mocks/active-license-response.json";
import { SetupFactoryOptions } from '../driver';

export const hasActiveLicense = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33333/api/license`, {
    body: content,
  });
  return content;
};
