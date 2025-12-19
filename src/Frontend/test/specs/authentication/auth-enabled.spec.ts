import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";

describe("FEATURE: Authentication Enabled (Scenario 2)", () => {
  describe("RULE: Authentication configuration endpoint should return valid OIDC config", () => {
    test("EXAMPLE: Auth config endpoint returns enabled with all required fields", async ({ driver }) => {
      const authConfig = await driver.setUp(precondition.scenarioAuthEnabled);

      // Verify all required fields are present
      expect(authConfig.enabled).toBe(true);
      expect(authConfig.client_id).toBeDefined();
      expect(authConfig.client_id).not.toBe("");
      expect(authConfig.authority).toBeDefined();
      expect(authConfig.authority).toContain("https://");
      expect(authConfig.api_scopes).toBeDefined();
      expect(authConfig.audience).toBeDefined();

      // Navigate to trigger app mount (required for cleanup)
      await driver.goTo("/dashboard");
    });

    test("EXAMPLE: Auth config endpoint is accessible without authentication", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAuthenticationEnabled());

      // Navigate to trigger app mount
      await driver.goTo("/dashboard");

      // The endpoint should be mocked and accessible
      const serviceControlUrl = window.defaultConfig.service_control_url;
      // eslint-disable-next-line local/no-raw-fetch
      const response = await fetch(`${serviceControlUrl}authentication/configuration`);

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.enabled).toBe(true);
    });
  });
});
