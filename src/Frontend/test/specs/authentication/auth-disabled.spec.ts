import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";

describe("FEATURE: Authentication Disabled (Scenario 1)", () => {
  describe("RULE: ServicePulse should load without login when auth is disabled", () => {
    test("EXAMPLE: Dashboard loads directly without authentication prompt", async ({ driver }) => {
      // Uses shared precondition for consistency with manual mock scenario
      await driver.setUp(precondition.scenarioAuthDisabled);

      await driver.goTo("/dashboard");

      await waitFor(() => {
        // Dashboard should load without redirect to login
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });
    });

    test("EXAMPLE: User profile menu should not appear when auth is disabled", async ({ driver }) => {
      await driver.setUp(precondition.scenarioAuthDisabled);

      await driver.goTo("/dashboard");

      await waitFor(() => {
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      });

      // User profile menu should not be present
      expect(screen.queryByTestId("user-profile-menu")).not.toBeInTheDocument();
    });
  });
});
