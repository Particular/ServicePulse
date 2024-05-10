import { servicePulseNoPlatformUpdatesNeeded } from "../mocks/platform-updates";
import { SetupFactoryOptions } from "../driver";

export const hasUpToDateServicePulse = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`https://platformupdate.particular.net/servicepulse.txt`, {
    body: { ...servicePulseNoPlatformUpdatesNeeded },
  });
  return { ...servicePulseNoPlatformUpdatesNeeded };
};
