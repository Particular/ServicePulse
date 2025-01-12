import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { messageShownWithText } from "./questions/messageShownWithText";
import { expect } from "vitest";
describe("FEATURE: No data", () => {
  describe("RULE: When there is no data to show a message should be displayed ", () => {
    test("EXAMPLE: There are no failed or passing custom checks", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      // Given there are no custom checks
      await driver.setUp(precondition.hasZeroCustomChecks);

      // When navigating to the custom checks tab
      await driver.goTo("/custom-checks");

      // Then a message is shown "No failed custom checks"
      expect(messageShownWithText("No failed custom checks")).toBe(true);
    });

    test("EXAMPLE: There are custom checks but none of them are failing", async ({ driver }) => {
      /* SCENARIO
          Given there are custom checks
          And all custom checks are in a success state
          When navigating to the custom checks tab
          The a message is shown "No failed custom checks"
        */
      await driver.setUp(precondition.serviceControlWithMonitoring);
      // Given there are custom checks but none of them are failing
      await driver.setUp(
        precondition.hasCustomChecks([
          { failed: false, reason: "Test reason 1" },
          { failed: false, reason: "Test reason 2" },
        ])
      );

      // When navigating to the custom checks tab
      await driver.goTo("/custom-checks");

      // Then a message is shown "No failed custom checks"
      expect(messageShownWithText("No failed custom checks")).toBe(true);
    });
  });
});
