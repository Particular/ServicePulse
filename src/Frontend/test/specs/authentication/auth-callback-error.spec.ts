import { vi, expect, beforeEach } from "vitest";
import { createOidcMockUnauthenticated } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts with unauthenticated state
vi.mock("oidc-client-ts", () => createOidcMockUnauthenticated());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";
import { useAuthStore } from "@/stores/AuthStore";

describe("FEATURE: OAuth Callback Error Handling (Scenario 16)", () => {
  describe("RULE: OAuth errors should be captured and displayed to the user", () => {
    // Store the original location
    let originalLocation: Location;

    beforeEach(() => {
      // Save original location
      originalLocation = window.location;
    });

    test("EXAMPLE: access_denied error sets auth error state", async ({ driver }) => {
      // Mock window.location.search to include OAuth error parameters
      // This simulates the IdP redirecting back with an error
      const mockSearch = "?error=access_denied&error_description=User%20cancelled%20the%20login";

      // Create a mock location object
      const mockLocation = {
        ...originalLocation,
        search: mockSearch,
        hash: "#/dashboard",
        href: `http://localhost:5173${mockSearch}#/dashboard`,
      };

      // Replace window.location
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      await driver.goTo("/dashboard");

      const authStore = useAuthStore();

      await waitFor(() => {
        // Auth error should be set from the URL parameters
        expect(authStore.authError).toBeTruthy();
      });

      // Verify the error message contains the description
      expect(authStore.authError).toContain("cancelled");

      // User should not be authenticated
      expect(authStore.isAuthenticated).toBe(false);

      // Restore original location
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    });

    test("EXAMPLE: invalid_request error sets auth error state", async ({ driver }) => {
      // Simulate invalid_request error (e.g., missing required parameter)
      const mockSearch = "?error=invalid_request&error_description=Missing%20required%20parameter";

      const mockLocation = {
        ...originalLocation,
        search: mockSearch,
        hash: "#/dashboard",
        href: `http://localhost:5173${mockSearch}#/dashboard`,
      };

      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      await driver.goTo("/dashboard");

      const authStore = useAuthStore();

      await waitFor(() => {
        expect(authStore.authError).toBeTruthy();
      });

      // Verify the error captures the description
      expect(authStore.authError).toContain("Missing");

      // User should not be authenticated
      expect(authStore.isAuthenticated).toBe(false);

      // Restore original location
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    });

    test("EXAMPLE: error without description uses error code", async ({ driver }) => {
      // Simulate error without description
      const mockSearch = "?error=server_error";

      const mockLocation = {
        ...originalLocation,
        search: mockSearch,
        hash: "#/dashboard",
        href: `http://localhost:5173${mockSearch}#/dashboard`,
      };

      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      await driver.goTo("/dashboard");

      const authStore = useAuthStore();

      await waitFor(() => {
        expect(authStore.authError).toBeTruthy();
      });

      // When no description, the error code should be used
      expect(authStore.authError).toBe("server_error");

      // User should not be authenticated
      expect(authStore.isAuthenticated).toBe(false);

      // Restore original location
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    });
  });
});
