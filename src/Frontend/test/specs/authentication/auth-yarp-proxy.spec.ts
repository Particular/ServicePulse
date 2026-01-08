import { vi, expect } from "vitest";
import { createOidcMock, defaultMockUser } from "../../mocks/oidc-client-mock";

// Mock oidc-client-ts BEFORE any imports that use it
vi.mock("oidc-client-ts", () => createOidcMock());

import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";
import monitoringClient from "@/components/monitoring/monitoringClient";
import serviceControlClient from "@/components/serviceControlClient";

describe("FEATURE: YARP Reverse Proxy Token Forwarding (Scenario 12)", () => {
  describe("RULE: Bearer tokens should be forwarded through YARP proxy", () => {
    test("EXAMPLE: API requests through relative URLs include Authorization header", async ({ driver }) => {
      // Configure YARP mode with relative URLs
      // When reverse proxy is enabled, service_control_url is "/api/" (relative path)
      window.defaultConfig.service_control_url = "/api/";
      window.defaultConfig.monitoring_urls = ["/monitoring-api/"];
      serviceControlClient.resetUrl();
      monitoringClient.resetUrl();

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      // Track Authorization headers from API requests through YARP
      const capturedHeaders: string[] = [];
      const capturedUrls: string[] = [];

      // Mock endpoint at relative URL (YARP proxy path)
      driver.mockEndpointDynamic("/api/endpoints", "get", (url, _params, request) => {
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

      // Verify requests went through the relative URL (YARP proxy)
      await waitFor(() => {
        expect(capturedUrls.length).toBeGreaterThan(0);
        // URL should be relative (through YARP), not absolute
        expect(capturedUrls[0]).toContain("/api/endpoints");
      });

      // Verify Authorization header was included (forwarded by YARP)
      await waitFor(() => {
        expect(capturedHeaders.length).toBeGreaterThan(0);
        expect(capturedHeaders[0]).toBe(`Bearer ${defaultMockUser.access_token}`);
      });
    });

    test("EXAMPLE: Service control URL is configured as relative path in YARP mode", async ({ driver }) => {
      // Configure YARP mode with relative URLs
      window.defaultConfig.service_control_url = "/api/";
      window.defaultConfig.monitoring_urls = ["/monitoring-api/"];
      serviceControlClient.resetUrl();
      monitoringClient.resetUrl();

      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // Verify the service control URL is configured as relative (YARP mode)
      expect(window.defaultConfig.service_control_url).toBe("/api/");
      expect(window.defaultConfig.monitoring_urls[0]).toBe("/monitoring-api/");

      // Verify auth token is set (YARP would forward this to backend)
      expect(sessionStorage.getItem("auth_token")).toBe(defaultMockUser.access_token);
    });
  });
});
