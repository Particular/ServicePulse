import { vi, expect } from "vitest";
import { createOidcMock } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts
vi.mock("oidc-client-ts", () => createOidcMock());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";
import { useAuthStore } from "@/stores/AuthStore";

describe("FEATURE: Auth Configuration Endpoint Unavailable (Scenario 15)", () => {
  describe("RULE: App should handle ServiceControl unavailability gracefully", () => {
    test("EXAMPLE: App continues to load when auth config endpoint returns error", async ({ driver }) => {
      // Set up ServiceControl endpoints but auth config returns 500 error
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationError(500));

      await driver.goTo("/dashboard");

      const authStore = useAuthStore();

      // App should not crash - should continue loading
      await waitFor(() => {
        // Loading should complete (not stuck)
        expect(authStore.loading).toBe(false);
      });

      // Since auth config failed, auth should be treated as disabled
      expect(authStore.authEnabled).toBe(false);

      // Dashboard should still be accessible (graceful degradation)
      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });
    });

    test("EXAMPLE: App continues to load when auth config endpoint returns 503", async ({ driver }) => {
      // Simulate ServiceControl being temporarily unavailable (503)
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationError(503));

      await driver.goTo("/dashboard");

      const authStore = useAuthStore();

      await waitFor(() => {
        // Loading should complete
        expect(authStore.loading).toBe(false);
        // Auth should be treated as disabled when config unavailable
        expect(authStore.authEnabled).toBe(false);
      });

      // App should not crash or show blank screen
      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });
    });

    test("EXAMPLE: App continues to load when auth config endpoint times out (network error)", async ({ driver }) => {
      // Set up basic ServiceControl endpoints
      await driver.setUp(precondition.serviceControlWithMonitoring);

      // Mock auth endpoint to throw network error
      const serviceControlUrl = window.defaultConfig.service_control_url;
      driver.mockEndpointDynamic(`${serviceControlUrl}authentication/configuration`, "get", () => {
        return Promise.reject(new Error("Network error: Connection refused"));
      });

      await driver.goTo("/dashboard");

      const authStore = useAuthStore();

      await waitFor(() => {
        // Loading should complete despite network error
        expect(authStore.loading).toBe(false);
      });

      // Auth should be disabled (graceful fallback)
      expect(authStore.authEnabled).toBe(false);

      // Dashboard should still render
      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });
    });
  });
});
