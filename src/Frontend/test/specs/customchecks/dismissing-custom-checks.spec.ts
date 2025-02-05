import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { customChecksListElement, customChecksDismissButtonList, customChecksFailedRowsList } from "./questions/failedCustomChecks";
import { waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";

describe("FEATURE: Dismiss custom checks", () => {
  describe("RULE: Dismiss button should be visible", () => {
    test("EXAMPLE: Dismiss button is visible on each failing custom check", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecks(3, 2));

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await customChecksDismissButtonList()).toHaveLength(3); //count of dismiss button
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
        expect(await customChecksFailedRowsList()).toHaveLength(3); //count of failed checks matches failing count set
      });

      let dismissButtonList = await customChecksDismissButtonList();
      expect(dismissButtonList).toHaveLength(3); //count of dismiss button matches the failed custom check count

      //click the dismiss button
      await userEvent.click(dismissButtonList[0]);

      //get the new  dismiss button list
      dismissButtonList = await customChecksDismissButtonList();
      //count of dismss button is decreased by 1
      expect(dismissButtonList).toHaveLength(2);
    });
  });
  describe("RULE: Failing after a dismiss should cause the failed check to reappear", () => {
    test("EXAMPLE: Dismissed custom check should reappear in the list when it fails", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);

      const customCheckItems = precondition.generateCustomChecksData(3, 0)();
      await driver.setUp(precondition.getCustomChecks(customCheckItems));
      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument(); //failed list is visisble
        expect(await customChecksFailedRowsList()).toHaveLength(3); //count of failed checks matches failing count set
      });

      const dismissButtonList = await customChecksDismissButtonList();
      expect(dismissButtonList).toHaveLength(3); //count of dismiss button

      //click  dismiss button
      await userEvent.click(dismissButtonList[0]);
      expect(await customChecksDismissButtonList()).toHaveLength(2); //count of dismiss button
      expect(await customChecksFailedRowsList()).toHaveLength(2); //count of failed checks matches failing count set

      //re-add the dismissed custom check Item

      await driver.setUp(precondition.getCustomChecks(customCheckItems));
      await driver.goTo("/custom-checks");
      //custom list should be increased to 3
      expect(await customChecksFailedRowsList()).toHaveLength(3); //count of failed checks matches failing count set
    });
  });
});
