import { vi, expect } from "vitest";
import { createOidcMock, defaultMockUser } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts BEFORE any imports that use it
vi.mock("oidc-client-ts", () => createOidcMock());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";

describe("FEATURE: Session Isolation Between Tabs (Scenario 7)", () => {
  describe("RULE: Sessions should be isolated per browser tab", () => {
    test("EXAMPLE: Auth token is stored in sessionStorage (tab-specific, not shared)", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // Verify token is in sessionStorage (tab-specific)
      const sessionToken = sessionStorage.getItem("auth_token");
      expect(sessionToken).toBe(defaultMockUser.access_token);

      // Verify token is NOT in localStorage (would be shared across tabs)
      const localToken = localStorage.getItem("auth_token");
      expect(localToken).toBeNull();
    });
  });
});
