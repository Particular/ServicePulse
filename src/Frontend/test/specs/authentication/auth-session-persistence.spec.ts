import { vi, expect } from "vitest";
import { createOidcMock, defaultMockUser } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts BEFORE any imports that use it
vi.mock("oidc-client-ts", () => createOidcMock());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";

describe("FEATURE: Session Persistence (Scenario 6)", () => {
  describe("RULE: Session should persist across navigation within the same tab", () => {
    test("EXAMPLE: Auth token persists when navigating between pages", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      // Initial navigation - triggers auth
      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // Verify initial auth token is set
      const initialToken = sessionStorage.getItem("auth_token");
      expect(initialToken).toBe(defaultMockUser.access_token);

      // Navigate to a different route
      await driver.goTo("/failed-messages/all");

      // Wait for navigation to complete
      await waitFor(() => {
        // Verify token persists after navigation
        const tokenAfterNav = sessionStorage.getItem("auth_token");
        expect(tokenAfterNav).toBe(defaultMockUser.access_token);
      });

      // Navigate back to dashboard
      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // Verify token still persists
      const tokenAfterReturn = sessionStorage.getItem("auth_token");
      expect(tokenAfterReturn).toBe(defaultMockUser.access_token);
    });
  });
});
