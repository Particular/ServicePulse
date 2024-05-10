import { SetupFactoryOptions } from "../driver";
import { heartbeatsFiveActiveOneFailing } from "../mocks/heartbeats-five-active-one-failing";
export const hasFiveActiveOneFailingHeartbeats = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}heartbeats/stats`, {
    body: { ...heartbeatsFiveActiveOneFailing },
  });
  return { ...heartbeatsFiveActiveOneFailing };
};
