
import { SetupFactoryOptions } from "../driver";
import content from "../mocks/heartbeats-four-active-two-failing.json"; 

export const hasFourActiveTwoFailingHeartbeats = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33333/api/heartbeats/stats`, {
    body: content
  });
  return content;
};
