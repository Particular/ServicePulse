import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { customChecksFailedRowsList, customChecksListElement, customChecksMessageElement, customChecksFailedReasonList, customChecksListPaginationElement, customChecksReportedDateList } from "./questions/failedCustomChecks";
import { waitFor } from "@testing-library/vue";
import { updateCustomCheckItemByStatus } from "../../preconditions/customChecks";

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

  describe("RULE: Failed custom checks should have pagination when failed checks count is greater than 10", () => {
    test("EXAMPLE: 11 failed custom checks is paginated on the custom checks tab", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecks(11, 3));

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument(); //failed list is visisble
      });
      expect(customChecksListPaginationElement()).toBeInTheDocument(); //pagination vsible
      await waitFor(async () => {
        expect(await customChecksFailedRowsList()).toHaveLength(11); //count of failed checks matches failing count set
      });
    });

    test("EXAMPLE: 9 failed custom checks is not paginated on the custom checks tab", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecks(9, 3));

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument(); //failed list is visisble
      });
      expect(customChecksListPaginationElement()).not.toBeInTheDocument(); //pagination vsible
      await waitFor(async () => {
        expect(await customChecksFailedRowsList()).toHaveLength(9); //count of failed checks matches failing count set
      });
    });
  });
  describe("RULE: Failed custom checks should be shown in descending order of last checked", () => {
    test("EXAMPLE:Three failed custom checks is  displayed in descending order of last checked on the custom checks tab", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecks(3, 3));

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument(); //failed list is visisble
      });
      await waitFor(async () => {
        expect(await customChecksFailedRowsList()).toHaveLength(3); //count of failed checks matches failing count set
      });

      const timestamps = await customChecksReportedDateList(); // Ensure this is awaited correctly

      // Ensure that the times are in descending order
      for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
      }
    });
  });
  describe("RULE: Custom checks should auto-refresh", () => {
    test("EXAMPLE:When a custom check fails, the custom checks tab is auto-refreshed with the new failed custom check", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const customCheckItems = precondition.generateCustomChecksData(3, 2)();
      await driver.setUp(precondition.getCustomChecks(customCheckItems));

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument(); //failed list is visisble
      });
      await waitFor(async () => {
        expect(await customChecksFailedRowsList()).toHaveLength(3); //count of failed checks matches failing count set
      });

      updateCustomCheckItemByStatus(customCheckItems, "Pass"); // Fail an existing item that is passing

      await driver.setUp(precondition.getCustomChecks(customCheckItems));

      await driver.goTo("/custom-checks");
      await waitFor(async () => {
        expect(await customChecksFailedRowsList()).toHaveLength(4); // Now it should be 4
      });
    });

    test("EXAMPLE: A failing custom check that begins passing is auto-refreshed and removed from the list on the custom checks tab", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const customCheckItems = precondition.generateCustomChecksData(3, 2)();
      await driver.setUp(precondition.getCustomChecks(customCheckItems));

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksListElement()).toBeInTheDocument(); //failed list is visisble
      });
      await waitFor(async () => {
        expect(await customChecksFailedRowsList()).toHaveLength(3); //count of failed checks matches failing count set
      });

      updateCustomCheckItemByStatus(customCheckItems, "Fail"); // an existing item that is failing

      await driver.setUp(precondition.getCustomChecks(customCheckItems));

      await driver.goTo("/custom-checks");
      await waitFor(async () => {
        expect(await customChecksFailedRowsList()).toHaveLength(2); // Now it should be 2
      });
    });
  });
});
