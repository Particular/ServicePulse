import { vi, expect } from "vitest";
import { createOidcMock, defaultMockUser } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts BEFORE any imports that use it
vi.mock("oidc-client-ts", () => createOidcMock());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";

describe("FEATURE: Authenticated User Access", () => {
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

  describe("RULE: Authenticated requests should include Bearer token", () => {
    test("EXAMPLE: API requests include Authorization header", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      // Track Authorization headers from API requests
      const capturedHeaders: string[] = [];
      const serviceControlUrl = window.defaultConfig.service_control_url;

      driver.mockEndpointDynamic(`${serviceControlUrl}endpoints`, "get", (_url, _params, request) => {
        const authHeader = request.headers.get("Authorization");
        if (authHeader) {
          capturedHeaders.push(authHeader);
        }
        return Promise.resolve({ body: [] });
      });

      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // Verify at least one request included the Bearer token
      await waitFor(() => {
        expect(capturedHeaders.length).toBeGreaterThan(0);
        expect(capturedHeaders[0]).toBe(`Bearer ${defaultMockUser.access_token}`);
      });
    });
  });
});
