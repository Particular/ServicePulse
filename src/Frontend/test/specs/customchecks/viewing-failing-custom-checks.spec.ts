import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { customChecksFailedRowsList, customChecksListElement, customChecksMessageElement, customChecksFailedReasonList, customChecksListPaginationElement } from "./questions/failedCustomChecks";
import { waitFor } from "@testing-library/vue";

describe("FEATURE: Failing custom checks", () => {
  describe("RULE: Failed custom checks should be displayed", () => {
    test("EXAMPLE: All custom checks are in a failed state are displayed in a list on the custom checks tab", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecks(5, 3));

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument(); //failed list is visisble
      });
      expect(customChecksMessageElement()).not.toBeInTheDocument(); //no data message is not vsible
      await waitFor(async () => {
        expect(await customChecksFailedRowsList()).toHaveLength(5); //count of failed checks matches failing count set

        const failedReasonList = await customChecksFailedReasonList();
        expect(failedReasonList).toHaveLength(5); //count of failed reasons matches failing count set

        failedReasonList.forEach((reason) => {
          const textContent = reason.textContent?.trim(); // Get the text and trim any surrounding whitespace
          expect(textContent).not.toBe(""); // Assert the failed reason text content is not empty
        });
      });
    });
  });

  describe("RULE: Failed custom checks should have pagination when failed checks count is greater than 50", () => {
    test("EXAMPLE: 51 failed custom checks is paginated on the custom checks tab", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecks(51, 3));

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument(); //failed list is visisble
      });
      expect(customChecksListPaginationElement()).toBeInTheDocument(); //pagination vsible
      await waitFor(async () => {
        expect(await customChecksFailedRowsList()).toHaveLength(51); //count of failed checks matches failing count set
      });
    });

    test("EXAMPLE: 49 failed custom checks is not paginated on the custom checks tab", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecks(49, 3));

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument(); //failed list is visisble
      });
      expect(customChecksListPaginationElement()).not.toBeInTheDocument(); //pagination vsible
      await waitFor(async () => {
        expect(await customChecksFailedRowsList()).toHaveLength(49); //count of failed checks matches failing count set
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
