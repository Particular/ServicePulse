/**
 * Scenario 2: Authentication Enabled
 *
 * This scenario mocks ServiceControl with authentication enabled.
 * The auth configuration endpoint returns valid OIDC settings.
 *
 * Note: This scenario only mocks the configuration endpoint.
 * The actual OIDC flow requires a real identity provider.
 *
 * Usage:
 *   set VITE_MOCK_SCENARIO=auth-enabled
 *   npm run dev:mocks
 *
 * Test:
 *   1. Open browser to the dev server URL
 *   2. ServicePulse should redirect to identity provider (will fail without real IdP)
 *   3. Check Network tab for /api/authentication/configuration response
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
  // Scenario 2: Authentication enabled (shared precondition)
  await driver.setUp(precondition.scenarioAuthEnabled);

  // Sample data for testing
  await driver.setUp(precondition.hasCustomChecks(3, 2));
  await driver.setUp(precondition.monitoredEndpointsNamed(["Sales.OrderProcessor", "Sales.PaymentHandler", "Shipping.DeliveryService"]));
})();
