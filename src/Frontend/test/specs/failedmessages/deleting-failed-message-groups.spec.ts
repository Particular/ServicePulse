import { expect } from "vitest";
import { waitFor } from "@testing-library/vue";
import { test, describe } from "../../drivers/vitest/driver";
import type { Driver } from "../../driver";
import * as precondition from "../../preconditions";
import type { DeletedMessageGroupsTestBed } from "../../preconditions/deletedMessageGroups";
import routeLinks from "@/router/routeLinks";
import { getDeletedMessageGroupRowCount, getDeletedMessageGroupRow } from "./questions/deletedMessageGroupRows";
import { isEmptyGroupsMessageVisible, isDismissButtonVisible, isRestoreCompletedVisible, isRestoreGroupConfirmationVisible } from "./questions/deletedMessageGroupsView";
import { clickRestoreGroup, confirmRestoreGroup } from "./actions/restoreDeletedMessageGroups";

const DELETED_MESSAGE_GROUPS = routeLinks.failedMessage.deletedMessagesGroup.link;

async function givenDeletedMessageGroupsAreShown(driver: Driver, titles: string[]): Promise<DeletedMessageGroupsTestBed> {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  const groups = titles.map((title, index) => precondition.createDeletedMessageGroup(`group-${index + 1}`, { title, count: 3, firstFailedDaysAgo: 5, lastFailedDaysAgo: 2, lastRetriedDaysAgo: 3 }));
  const bed = await driver.setUp(precondition.hasDeletedMessageGroups({ groups }));

  await driver.goTo(DELETED_MESSAGE_GROUPS);
  await waitFor(() => expect(getDeletedMessageGroupRowCount()).toBe(groups.length), { timeout: 5000 });

  return bed;
}

describe("FEATURE: Deleted Message Groups", () => {
  describe("RULE: Deleted Message Groups view should shows all current deleted messages, grouped by the selected grouping", () => {
    test("EXAMPLE: A message should be show when there are no deleted messages", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasDeletedMessageGroups({ groups: [] }));
      await driver.goTo(DELETED_MESSAGE_GROUPS);

      await waitFor(() => expect(isEmptyGroupsMessageVisible()).toBe(true));
      expect(getDeletedMessageGroupRowCount()).toBe(0);
    });

    test("EXAMPLE: The name of a deleted message group should be shown in bold", async ({ driver }) => {
      await givenDeletedMessageGroupsAreShown(driver, ["Payments failures"]);

      const row = getDeletedMessageGroupRow("Payments failures");
      expect(row?.title).toBe("Payments failures");
      expect(row?.titleIsBold).toBe(true);
    });

    test("EXAMPLE: The number of deleted messages in a group should be shown", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasDeletedMessageGroups({ groups: [precondition.createDeletedMessageGroup("group-1", { title: "Payments failures", count: 7 })] }));
      await driver.goTo(DELETED_MESSAGE_GROUPS);
      await waitFor(() => expect(getDeletedMessageGroupRowCount()).toBe(1));

      expect(getDeletedMessageGroupRow("Payments failures")?.messageCount).toBe("7 messages");
    });

    test("EXAMPLE: The time period from the first failed message should be shown", async ({ driver }) => {
      await givenDeletedMessageGroupsAreShown(driver, ["Payments failures"]);

      expect(getDeletedMessageGroupRow("Payments failures")?.firstFailed).toBe("5 days ago");
    });

    test("EXAMPLE: The time period of the last failed message should be shown", async ({ driver }) => {
      await givenDeletedMessageGroupsAreShown(driver, ["Payments failures"]);

      expect(getDeletedMessageGroupRow("Payments failures")?.lastFailed).toBe("2 days ago");
    });

    test("EXAMPLE: The time period of when the group was last retried should be shown", async ({ driver }) => {
      await givenDeletedMessageGroupsAreShown(driver, ["Payments failures"]);

      expect(getDeletedMessageGroupRow("Payments failures")?.lastRetried).toBe("3 days ago");
    });

    test("EXAMPLE: A deleted message group that has not been retried should show N/A for the last retry time", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasDeletedMessageGroups({ groups: [precondition.createDeletedMessageGroup("group-1", { title: "Payments failures" })] }));
      await driver.goTo(DELETED_MESSAGE_GROUPS);
      await waitFor(() => expect(getDeletedMessageGroupRowCount()).toBe(1));

      expect(getDeletedMessageGroupRow("Payments failures")?.lastRetried).toMatch(/n\/a/i);
    });
  });
  describe("RULE: All messages in a Deleted Message Group should be able to be restored in a single action", () => {
    test("EXAMPLE: A restore button should be shown when there are deleted messages in a group", async ({ driver }) => {
      await givenDeletedMessageGroupsAreShown(driver, ["Payments failures"]);

      const row = getDeletedMessageGroupRow("Payments failures");
      expect(row?.restoreGroupText).toBe("Restore group");
      expect(row?.restoreGroupIsDisabled).toBe(false);
    });

    test("EXAMPLE: Restoring a group restores all its messages and the list refreshes with confirmation", async ({ driver }) => {
      const bed = await givenDeletedMessageGroupsAreShown(driver, ["Payments failures"]);

      await clickRestoreGroup("Payments failures");
      expect(isRestoreGroupConfirmationVisible()).toBe(true);
      await confirmRestoreGroup();

      await waitFor(() => expect(bed.restoredGroupIds).toEqual(["group-1"]));

      await waitFor(
        () => {
          expect(isRestoreCompletedVisible()).toBe(true);
          expect(isDismissButtonVisible()).toBe(true);
        },
        { timeout: 5000 }
      );

      expect(getDeletedMessageGroupRow("Payments failures")?.restoreGroupText).toBeNull();
    });
  });
});
