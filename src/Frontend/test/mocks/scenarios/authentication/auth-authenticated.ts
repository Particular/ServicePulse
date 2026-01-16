/**
 * Scenario 3: Authenticated User State
 *
 * This scenario mocks a user who has completed the OIDC login flow.
 * The app loads with an authenticated session already established.
 *
 * Note: This bypasses the actual OIDC redirect flow - it simulates
 * the state after a successful login.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=auth-authenticated
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. Dashboard should load directly (no login redirect)
 *   3. User profile menu should appear in header
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
  // Scenario 3: Authenticated user state (shared precondition)
  await driver.setUp(precondition.scenarioAuthenticatedUser);

  // Sample data for testing
  await driver.setUp(precondition.hasCustomChecks(3, 2));
  await driver.setUp(precondition.monitoredEndpointsNamed(["Sales.OrderProcessor", "Sales.PaymentHandler", "Shipping.DeliveryService"]));
})();
