import { SetupFactoryOptions } from "../driver";

const content = JSON.stringify(0);

export const hasNoDisconnectedEndpoints = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33633/monitored-endpoints/disconnected`, {
    body: content,
  });
  return content;
};
