import { SetupFactoryOptions } from "../driver";
import content from "../mocks/heartbeats-five-active-one-failing.json"; 

export const hasFiveActiveOneFailingHeartbeats = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33333/api/heartbeats/stats`, {
    body: content
  });
  return content;
};