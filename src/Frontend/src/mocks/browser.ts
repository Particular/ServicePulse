import { setupWorker } from 'msw/browser';
import { Driver } from "../../test/driver";
import { makeMockEndpoint } from "../../test/mock-endpoint";
import { serviceControlWithMonitoring,monitoredEndpointsNamed } from "../../test/preconditions"
export const worker = setupWorker();
const mockEndpoint = makeMockEndpoint({ mockServer: worker });

const makeDriver = (): Driver => ({
    async goTo() {
      
    },
    mockEndpoint,
    setUp(factory) {
        return factory({ driver: this });
      },
});

const driver = makeDriver();

driver.setUp(serviceControlWithMonitoring).then(async ()  => {
  //override the default mocked endpoints with a custom list
  await driver.setUp(monitoredEndpointsNamed(["Endpoint1","Endpoint2","Endpoint3"]));
});


