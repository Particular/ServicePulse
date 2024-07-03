import { setupWorker } from "msw/browser";
import { Driver } from "../driver";
import { makeMockEndpoint } from "../mock-endpoint";
import { serviceControlWithMonitoring, LicenseType, hasExpiringLicense, hasExpiredLicense } from "../preconditions";
export const worker = setupWorker();
const mockEndpoint = makeMockEndpoint({ mockServer: worker });

const makeDriver = (): Driver => ({
  async goTo() {
    throw new Error("Not implemented");
  },
  mockEndpoint,
  setUp(factory) {
    return factory({ driver: this });
  },
  disposeApp() {
    throw new Error("Not implemented");
  },
});

const driver = makeDriver();

(async () => {
  await driver.setUp(serviceControlWithMonitoring);
  //override the default mocked endpoints with a custom list
  await driver.setUp(serviceControlWithMonitoring);
  await driver.setUp(hasExpiringLicense(LicenseType.UpgradeProtection));
})();
