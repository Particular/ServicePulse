import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import { waitFor } from "@testing-library/vue";
import * as precondition from "../../preconditions";
import { installPlatformHealthDevControls } from "../../mocks/platform-health-state";

describe("FEATURE: Platform health primary unavailable", () => {
  test("EXAMPLE: primary unavailable does not load remotes or custom checks", async ({ driver }) => {
    await driver.setUp(precondition.serviceControlWithMonitoring);
    await driver.setUp(precondition.hasCustomChecks(1, 0));
    installPlatformHealthDevControls();
    window.__platformHealth?.setScenario("primary-unavailable");

    await driver.goTo("/platform-health");

    await waitFor(() => {
      const state = window.__platformHealth?.getState();
      expect(state?.scenario).toBe("primary-unavailable");
      expect(state?.remotes).toHaveLength(0);
    });

    expect(window.__platformHealth?.getCustomChecks()).toHaveLength(0);
  });
});
