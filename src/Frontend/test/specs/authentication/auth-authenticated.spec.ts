import { vi, expect } from "vitest";
import { createOidcMock, defaultMockUser } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts BEFORE any imports that use it
vi.mock("oidc-client-ts", () => createOidcMock());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";

describe("FEATURE: Authentication Enabled (Scenario 3)", () => {
  describe("RULE: Authenticated users should see the dashboard", () => {
    test("EXAMPLE: Dashboard loads with authenticated user", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // Verify auth token was set by the mocked UserManager
      const authToken = sessionStorage.getItem("auth_token");
      expect(authToken).toBe(defaultMockUser.access_token);
    });
  });
});
