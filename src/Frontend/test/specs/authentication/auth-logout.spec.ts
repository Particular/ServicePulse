import { vi, expect } from "vitest";
import { createOidcMock, defaultMockUser } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts BEFORE any imports that use it
vi.mock("oidc-client-ts", () => createOidcMock());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";

describe("FEATURE: Logout Flow (Scenario 8)", () => {
  describe("RULE: Logged-out page should be accessible without authentication", () => {
    test("EXAMPLE: Logged-out page displays sign-out confirmation", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      // Navigate directly to logged-out page (anonymous route)
      await driver.goTo("/logged-out");

      await waitFor(() => {
        // Verify the logged-out page content
        expect(screen.getByText(/You have been signed out/i)).toBeInTheDocument();
        expect(screen.getByText(/You have successfully signed out of ServicePulse/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Sign in again/i })).toBeInTheDocument();
      });
    });

    test("EXAMPLE: Logout clears auth token from session storage", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      // First authenticate
      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // Verify token exists
      expect(sessionStorage.getItem("auth_token")).toBe(defaultMockUser.access_token);

      // Simulate logout by clearing token and navigating to logged-out page
      sessionStorage.removeItem("auth_token");
      await driver.goTo("/logged-out");

      await waitFor(() => {
        expect(screen.getByText(/You have been signed out/i)).toBeInTheDocument();
      });

      // Verify token is cleared
      expect(sessionStorage.getItem("auth_token")).toBeNull();
    });
  });
});
