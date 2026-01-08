/**
 * Scenario 1: Authentication Disabled (Default)
 *
 * This scenario mocks ServiceControl with authentication disabled.
 * ServicePulse loads directly without any login prompt.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=auth-disabled
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. ServicePulse should load directly without login
 *   3. User profile menu should NOT appear in header
 */
import { setupWorker } from "msw/browser";
import { Driver } from "../../../driver";
import { makeMockEndpoint, makeMockEndpointDynamic } from "../../../mock-endpoint";
import * as precondition from "../../../preconditions";

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

// Export a promise that resolves when all mock handlers are registered
export const setupComplete = (async () => {
  // Scenario 1: Authentication disabled (shared precondition)
  await driver.setUp(precondition.scenarioAuthDisabled);

  // Sample data for testing
  await driver.setUp(precondition.hasCustomChecks(3, 2));
  await driver.setUp(precondition.monitoredEndpointsNamed(["Sales.OrderProcessor", "Sales.PaymentHandler", "Shipping.DeliveryService"]));
})();
