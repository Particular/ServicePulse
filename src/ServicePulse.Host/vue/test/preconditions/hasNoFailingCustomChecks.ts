import { SetupFactoryOptions } from "../driver";

const content = JSON.stringify([]);

export const hasNoFailingCustomChecks = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint('http://localhost:33333/api/customchecks', {
    body: content,
  });
  return content;
};
