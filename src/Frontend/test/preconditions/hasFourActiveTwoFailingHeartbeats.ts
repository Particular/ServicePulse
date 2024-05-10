import { SetupFactoryOptions } from "../driver";
import { heartbeatsFourActiveTwoFailing } from "../mocks/heartbeats-four-active-two-failing";

export const hasFourActiveTwoFailingHeartbeats = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}heartbeats/stats`, {
    body: { ...heartbeatsFourActiveTwoFailing },
  });
  return { ...heartbeatsFourActiveTwoFailing };
};
