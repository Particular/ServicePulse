import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { customChecksMessage } from "./questions/customChecksMessage";
import { waitFor } from "@testing-library/vue";

describe("FEATURE: No data", () => {
  describe("RULE: When there is no data to show a message should be displayed ", () => {
    /* SCENARIO
          Given there are no custom checks
          When navigating to the custom checks tab
          Then a message is shown "No failed custom checks"
        */
    test("EXAMPLE: 'No failed custom checks' should be displayed when there are no custom checks", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      // given that the custom check list is empty
      await driver.setUp(precondition.hasCustomChecksEmpty);

      //Act - When navigating to the custom checks tab
      await driver.goTo("/custom-checks");
      //Expect
      await waitFor(async () => {
        expect(await customChecksMessage()).toBe("No failed custom checks");
      });
    });
    /* SCENARIO
          Given there are custom checks
          And all custom checks are in a success state
          When navigating to the custom checks tab
          Then a message is shown "No failed custom checks"
        */
    test("EXAMPLE: 'No failed custom checks' should be displayed when all custom checks are in a success state", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      // given that the custom check list is not empty and status of all checks are passing
      await driver.setUp(precondition.hasCustomChecksPassing);

      //Act - When navigating to the custom checks tab
      await driver.goTo("/custom-checks");
      //Expect
      await waitFor(async () => {
        expect(await customChecksMessage()).toBe("No failed custom checks");
      });
    });
  });
});
