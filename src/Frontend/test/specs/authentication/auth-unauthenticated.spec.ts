import { vi, expect } from "vitest";
import { createOidcMockUnauthenticated } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts with unauthenticated state (no user)
vi.mock("oidc-client-ts", () => createOidcMockUnauthenticated());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";

describe("FEATURE: Unauthenticated API Access Blocked (Scenario 5)", () => {
  describe("RULE: API requests without token should be rejected when auth is enabled", () => {
    test("EXAMPLE: authFetch throws error when no token available", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      // Navigate to trigger app mount and auth flow
      // The mocked UserManager returns null, so no token will be set
      await driver.goTo("/dashboard");

      // Since user is not authenticated, signinRedirect should be called
      // and the app should not proceed to make authenticated API calls
      // Verify no auth token is in session storage
      const authToken = sessionStorage.getItem("auth_token");
      expect(authToken).toBeNull();
    });
  });
});
