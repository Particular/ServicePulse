import { SetupFactoryOptions } from "../driver";

const content = JSON.stringify([]);

export const hasNoErrors = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33333/api/errors`, {
    body: content,
  });
  return content;
};
