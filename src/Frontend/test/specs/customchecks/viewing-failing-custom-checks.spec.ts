import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { customChecksFailedReasonList, customChecksList } from "./questions/failedCustomChecks";
import { waitFor } from "@testing-library/vue";
import { customCheckItems } from "../../mocks/custom-checks-template";

describe("FEATURE: Failing custom checks", () => {
  describe("RULE: Custom checks are displayed", () => {
    test("EXAMPLE: All custom checks are in a failed state are displayed in a list on the custom checks tab", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecks);
      // const response = precondition.hasCustomChecks;
      // const expectedCount = response.headers["Total-Count"];
      const expectedCount = customCheckItems.filter((check) => check.status === "Fail").length.toString();
      await driver.goTo("/custom-checks");
      //  console.log("resp:" + expectedCount);
      await waitFor(async () => {
        // expect(await customChecksMessageElement()).not.toBeInTheDocument(); //no data message is not vsible

        expect(await customChecksList()).toHaveLength(Number(expectedCount)); //count of failed checks matches the response received
        const failedCustomChecksReasonsList = await customChecksFailedReasonList();
        expect(failedCustomChecksReasonsList).toHaveLength(Number(expectedCount)); //count of failed reasons matches the response received
        // Ensure that each reason has non-empty text
        failedCustomChecksReasonsList.forEach((reason) => {
          const textContent = reason.textContent?.trim(); // Get the text and trim any surrounding whitespace
          expect(textContent).not.toBe(""); // Assert the text content is not empty
        });
      });
    });
  });
  describe("RULE: Failed custom checks should be shown in descending order of last checked", () => {
    test.todo("EXAMPLE: Three failed custom checks is  displayed in descending order of last checked on the custom checks tab");

    /* SCENARIO
          Given there are three failed custom checks
          And the custom checks failed at different times
          When navigating to the custom checks tab
          Then the custom checks are shown in descending order of last checked
        */
  });
  describe("RULE: Failed custom checks should have pagination", () => {
    test.todo("EXAMPLE: 51 failed custom checks is paginated on the custom checks tab");

    /* SCENARIO
          Given there are 51 failed custom checks
          When navigating to the custom checks tab
          Then the pagination controls should be visible
          And the page number should be 1
          And only the first 50 custom checks should be rendered
          And page 2 should be available to click on
        */

    test.todo("EXAMPLE: 49 failed custom checks is not paginated on the custom checks tab");
    /* SCENARIO
          Given there are 49 failed custom checks
          When navigating to the custom checks tab
          Then the pagination controls should not be visible
        */
  });
  describe("RULE: Custom checks should auto-refresh", () => {
    test.todo("EXAMPLE: When a custom check fails, the custom checks tab is auto-refreshed with the new failed custom check");

    /* SCENARIO
          Given 2 passing custom checks
          And the custom checks page is open
          When the endpoint reports a failing custom check
          Then the failing custom check should be rendered
        */

    test.todo("EXAMPLE: A failing custom check that begins passing is auto-refreshed and removed from the list on the custom checks tab");
    /* SCENARIO
          Given 2 failing custom checks
          And the custom checks page is open
          When one of the custom checks passes
          Then the passing custom check should be removed from the list
        */
  });
});
