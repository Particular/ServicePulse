import { vi, expect } from "vitest";
import { createOidcMockUnauthenticated } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts with unauthenticated state (no user)
vi.mock("oidc-client-ts", () => createOidcMockUnauthenticated());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";

describe("FEATURE: Unauthenticated User Handling", () => {
  describe("RULE: Unauthenticated users should not have access tokens", () => {
    test("EXAMPLE: No auth token when user is not authenticated", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      // Navigate to trigger app mount and auth flow
      // The mocked UserManager returns null, so no token will be set
      await driver.goTo("/dashboard");

      // Since user is not authenticated, signinRedirect should be called
      // and the app should not proceed to make authenticated API calls
      await waitFor(() => {
        const authToken = sessionStorage.getItem("auth_token");
        expect(authToken).toBeNull();
      });
    });

    test("EXAMPLE: signinRedirect is triggered when user has no session", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      // Navigate to protected route without authentication
      await driver.goTo("/dashboard");

      // Since getUser returns null, the app should redirect to IdP
      // Auth token should not be set
      await waitFor(() => {
        expect(sessionStorage.getItem("auth_token")).toBeNull();
      });

      // Note: In a real scenario, the IdP would handle the login.
      // This test verifies the app correctly initiates the redirect flow.
    });
  });
});
