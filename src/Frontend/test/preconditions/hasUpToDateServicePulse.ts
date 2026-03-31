import { servicePulseNoPlatformUpdatesNeeded } from "../mocks/platform-updates-template";
import type { SetupFactoryOptions } from "../driver";

export const hasUpToDateServicePulse = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`https://platformupdate.particular.net/servicepulse.txt`, {
    body: servicePulseNoPlatformUpdatesNeeded,
  });
  return servicePulseNoPlatformUpdatesNeeded;
};
