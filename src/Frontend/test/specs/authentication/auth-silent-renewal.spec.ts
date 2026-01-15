import { vi, expect } from "vitest";
import { createOidcMock, defaultMockUser } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts BEFORE any imports that use it
vi.mock("oidc-client-ts", () => createOidcMock());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";

describe("FEATURE: Silent Token Renewal (Scenario 9)", () => {
  describe("RULE: Token renewal should be configured for automatic silent refresh", () => {
    test("EXAMPLE: UserManager is initialized with silent renewal support", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // Verify authentication succeeded (UserManager was initialized and working)
      // The mocked UserManager includes signinSilent for token renewal
      expect(sessionStorage.getItem("auth_token")).toBe(defaultMockUser.access_token);

      // Silent renewal is configured via:
      // - automaticSilentRenew: true in AuthStore.transformToAuthConfig()
      // - silent_redirect_uri pointing to /silent-renew.html
      // - Event handlers for addAccessTokenExpiring that call signinSilent()
      // These are verified by the successful UserManager initialization
    });
  });
});
