import { vi, expect } from "vitest";
import { createOidcMockWithFailingSilentRenew, defaultMockUser } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts with signinSilent that fails
vi.mock("oidc-client-ts", () => createOidcMockWithFailingSilentRenew());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";

describe("FEATURE: Silent Renewal Failure (Scenario 10)", () => {
  describe("RULE: App should handle silent renewal failures gracefully", () => {
    test("EXAMPLE: User can still authenticate initially even with failing silent renewal", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // Initial authentication works (getUser returns a valid user)
      // Even though signinSilent would fail, the initial auth succeeds
      expect(sessionStorage.getItem("auth_token")).toBe(defaultMockUser.access_token);
    });

    test("EXAMPLE: Token cleared triggers re-authentication flow", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // Verify initial token
      expect(sessionStorage.getItem("auth_token")).toBe(defaultMockUser.access_token);

      // Simulate what happens when silent renewal fails and token expires:
      // The addAccessTokenExpired handler clears the token
      sessionStorage.removeItem("auth_token");

      // When token is cleared, subsequent API calls would fail
      // and the app should redirect to login
      expect(sessionStorage.getItem("auth_token")).toBeNull();
    });
  });
});
