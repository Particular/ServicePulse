import { setupWorker } from "msw/browser";
import { Driver } from "../driver";
import { makeMockEndpoint, makeMockEndpointDynamic } from "../mock-endpoint";
import * as precondition from "../preconditions";

export const worker = setupWorker();
const mockEndpoint = makeMockEndpoint({ mockServer: worker });
const mockEndpointDynamic = makeMockEndpointDynamic({ mockServer: worker });

const makeDriver = (): Driver => ({
  goTo() {
    throw new Error("Not implemented");
  },
  mockEndpoint,
  mockEndpointDynamic,
  setUp(factory) {
    return factory({ driver: this });
  },
  disposeApp() {
    throw new Error("Not implemented");
  },
});

const driver = makeDriver();

(async () => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(precondition.HasHealthyAndUnHealthyEndpoints(1, 1));
})();
