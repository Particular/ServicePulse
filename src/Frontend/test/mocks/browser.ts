import { setupWorker } from "msw/browser";
import { Driver } from "../driver";
import { makeMockEndpoint, makeMockEndpointWithQueryString } from "../mock-endpoint";
import * as precondition from "../preconditions";
export const worker = setupWorker();
const mockEndpoint = makeMockEndpoint({ mockServer: worker });
const mockEndpointWithQueryString = makeMockEndpointWithQueryString({ mockServer: worker });

const makeDriver = (): Driver => ({
  async goTo() {
    throw new Error("Not implemented");
  },
  mockEndpoint,
  mockEndpointWithQueryString,
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
  //override the default mocked endpoints with a custom list
  await driver.setUp(
    precondition.monitoredEndpointsNamed([
      "Universe.Solarsystem.Mercury.Endpoint1",
      "Universe.Solarsystem.Mercury.Endpoint2",
      "Universe.Solarsystem.Venus.Endpoint3",
      "Universe.Solarsystem.Venus.Endpoint4",
      "Universe.Solarsystem.Earth.Endpoint5",
      "Universe.Solarsystem.Earth.Endpoint6",
    ])
  );

  await driver.setUp(
    precondition.hasFailedMessage({
      withGroupId: "81dca64e-76fc-e1c3-11a2-3069f51c58c8",
      withMessageId: "40134401-bab9-41aa-9acb-b19c0066f22d",
      withContentType: "application/json",
      withBody: {"Index":0,"Data":""},
    })
  );
})();
