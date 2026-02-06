import { vi, expect } from "vitest";
import { createOidcMock, defaultMockUser } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts BEFORE any imports that use it
vi.mock("oidc-client-ts", () => createOidcMock());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";

describe("FEATURE: Direct ServiceControl Access (Scenario 13)", () => {
  describe("RULE: Bearer tokens should be included when accessing ServiceControl directly", () => {
    test("EXAMPLE: API requests to absolute URLs include Authorization header", async ({ driver }) => {
      // Default configuration uses absolute URLs (reverse proxy disabled mode)
      // service_control_url is "http://localhost:33333/api/" by default
      const serviceControlUrl = window.defaultConfig.service_control_url;

      // Verify we're using absolute URL (not relative YARP path)
      expect(serviceControlUrl).toMatch(/^https?:\/\//);
      expect(serviceControlUrl).not.toBe("/api/");

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      // Track Authorization headers from API requests
      const capturedHeaders: string[] = [];
      const capturedUrls: string[] = [];

      // Mock endpoint at absolute URL (direct ServiceControl access)
      driver.mockEndpointDynamic(`${serviceControlUrl}endpoints`, "get", (url, _params, request) => {
        capturedUrls.push(url.toString());
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

      // Verify requests went to absolute URL (direct access, not through YARP)
      await waitFor(() => {
        expect(capturedUrls.length).toBeGreaterThan(0);
        // URL should be absolute (direct to ServiceControl)
        expect(capturedUrls[0]).toMatch(/^https?:\/\/localhost:\d+/);
      });

      // Verify Authorization header was included
      await waitFor(() => {
        expect(capturedHeaders.length).toBeGreaterThan(0);
        expect(capturedHeaders[0]).toBe(`Bearer ${defaultMockUser.access_token}`);
      });
    });

    test("EXAMPLE: Service control URL is configured as absolute path in direct mode", async ({ driver }) => {
      // Default configuration uses absolute URLs
      const serviceControlUrl = window.defaultConfig.service_control_url;

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // Verify the service control URL is configured as absolute (direct mode)
      expect(serviceControlUrl).toMatch(/^https?:\/\//);
      expect(serviceControlUrl).toContain("localhost");

      // Verify auth token is set
      expect(sessionStorage.getItem("auth_token")).toBe(defaultMockUser.access_token);
    });
  });
});
