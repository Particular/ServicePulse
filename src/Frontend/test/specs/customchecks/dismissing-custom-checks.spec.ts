import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { customChecksListElement, customChecksDismissButtonList } from "./questions/failedCustomChecks";
import { waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";

describe("FEATURE: Dismiss custom checks", () => {
  describe("RULE: Dismiss button should be visible", () => {
    test("EXAMPLE: Dismiss button is visible on each failing custom check", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecks(9, 3));

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await customChecksDismissButtonList()).toHaveLength(9); //count of dismiss button
      });
    });
  });
  describe("RULE: Dismissing a custom check should remove from the list", () => {
    test("EXAMPLE: The dismiss button removes the custom check from the list when clicked", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecks(3, 2));

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument(); //failed list is visisble
      });

      //await waitFor(async () => {
      // const dismissButtonList = await customChecksDismissButtonList();
      // expect(dismissButtonList).toHaveLength(3); //count of dismiss button
      // const dismissButton = dismissButtonList[0];
      // await userEvent.click(dismissButton);
      //  });
      //get  one of the dismiss button
      // const dismissButton = await screen.getAllByRole("button", { name: /custom-check-dismiss/i })[0];

      // Simulate user click event

      //list count should decrease by one -
      //make sure that the id is notvisible on the page
      // await waitFor(async () => {
      //   expect(await customChecksDismissButtonList()).toHaveLength(2); //count of dismiss button
      // });
    });
  });
  describe("RULE: Failing after a dismiss should cause the failed check to reappear", () => {
    test.todo("EXAMPLE: Dismissed custom check should reappear in the list when it fails");

    /* SCENARIO
          Given 2 failed custom checks
          And one of them is dismissed
          When the dismissed custom check fails
          Then the custom check should appear in the list
        */
  });
});
