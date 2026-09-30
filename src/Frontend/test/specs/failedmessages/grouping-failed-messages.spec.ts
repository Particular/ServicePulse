import { expect } from "vitest";
import { waitFor } from "@testing-library/vue";
import { flushPromises } from "@vue/test-utils";
import { test, describe } from "../../drivers/vitest/driver";
import type { Driver } from "../../driver";
import * as precondition from "../../preconditions";
import type { FailedMessageGroupOptions, FailedMessageGroupsTestBed } from "../../preconditions/failedMessageGroups";
import routeLinks from "@/router/routeLinks";
import type HistoricRetryOperation from "@/resources/HistoricRetryOperation";
import { getCompletedRetryRequestRows, isCompletedRetryRequestsListExpanded, isNoCompletedRetryRequestsMessageVisible, visibleCompletedRetryRequestsSummary } from "./questions/completedRetryRequests";
import { toggleCompletedRetryRequests } from "./actions/toggleCompletedRetryRequests";
import { tabBadge } from "./questions/failedMessagesTabs";
import { getFailedMessageGroupRow, getFailedMessageGroupRowCount, getFailedMessageGroupRows } from "./questions/failedMessageGroupRows";
import { isConfirmationDialogVisible, isDeleteCompletedVisible, isDismissButtonVisible, isEmptyGroupsMessageVisible, selectedGrouping, selectedSort } from "./questions/failedMessageGroupsView";
import { clickGroupAction, confirmDialog, selectGrouping, selectSort } from "./actions/failedMessageGroupActions";
import { hoverFailedMessageGroup } from "./actions/hoverFailedMessageGroup";
import { selectFailedMessageGroup } from "./actions/selectFailedMessageGroup";
import { openTab } from "./actions/openTab";

const FAILED_MESSAGE_GROUPS = routeLinks.failedMessage.failedMessagesGroups.link;
const ALL_FAILED_MESSAGES = routeLinks.failedMessage.failedMessages.link;
const DELETED_MESSAGE_GROUPS = routeLinks.failedMessage.deletedMessagesGroup.link;

const RETRY_GROUP_CONFIRMATION = /retry this group/i;
const DELETE_GROUP_CONFIRMATION = /delete this group/i;
const DELETE_NOTE_CONFIRMATION = /delete this note/i;

async function givenFailedMessageGroupsAreShown(driver: Driver, groups: { title: string; options?: FailedMessageGroupOptions }[]): Promise<FailedMessageGroupsTestBed> {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  const bed = await driver.setUp(precondition.hasFailedMessageGroups({ groups: groups.map(({ title, options }, index) => precondition.createFailedMessageGroup(`group-${index + 1}`, { title, ...options })) }));

  await driver.goTo(FAILED_MESSAGE_GROUPS);
  await waitFor(() => expect(getFailedMessageGroupRowCount()).toBe(groups.length), { timeout: 5000 });

  return bed;
}

async function givenCompletedRetryRequests(driver: Driver, operations: HistoricRetryOperation[]): Promise<void> {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(precondition.hasFailedMessageGroups({ groups: [precondition.createFailedMessageGroup("group-1", { title: "Payments failures" })] }));
  const bed = await driver.setUp(precondition.hasCompletedRetryRequests({ operations }));

  await driver.goTo(FAILED_MESSAGE_GROUPS);
  await waitFor(() => expect(getFailedMessageGroupRowCount()).toBe(1), { timeout: 5000 });
  // The list starts empty, so an empty list alone doesn't prove the history response was rendered
  await waitFor(() => expect(bed.historyRequestCount).toBeGreaterThan(0));
  await flushPromises();
  await waitFor(() => expect(getCompletedRetryRequestRows()).toHaveLength(operations.length));
}

async function givenFailedMessageCounts(driver: Driver, counts: { failed?: number; deleted?: number }): Promise<void> {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(precondition.hasFailedMessageGroups({ groups: [] }));
  await driver.setUp(precondition.hasFailedMessageCounts(counts));

  await driver.goTo(FAILED_MESSAGE_GROUPS);
}

function currentRoute(): string {
  return window.location.hash.replace(/^#/, "");
}

describe("FEATURE: Failed Message Groups", () => {
  describe("RULE: Failed Message Groups view should shows all current failed messages, grouped by the selected grouping and sorted by the selected sort", () => {
    test("EXAMPLE: A message should be shown when there are no failed messages", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasFailedMessageGroups({ groups: [] }));
      await driver.goTo(FAILED_MESSAGE_GROUPS);

      await waitFor(() => expect(isEmptyGroupsMessageVisible()).toBe(true));
      expect(getFailedMessageGroupRowCount()).toBe(0);
    });
  });

  describe("RULE: Overview information of each group should be displayed without having to navigate to the Failed Message Group details", () => {
    test("EXAMPLE: The number of deleted messages in a group should be shown", async ({ driver }) => {
      await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures", options: { count: 7 } }]);

      expect(getFailedMessageGroupRow("Payments failures")?.messageCount).toBe("7 messages");
    });

    test("EXAMPLE: The time period from the first failed message should be shown", async ({ driver }) => {
      await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures", options: { firstFailedDaysAgo: 5 } }]);

      expect(getFailedMessageGroupRow("Payments failures")?.firstFailed).toBe("5 days ago");
    });

    test("EXAMPLE: The time period of the last failed message should be shown", async ({ driver }) => {
      await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures", options: { lastFailedDaysAgo: 2 } }]);

      expect(getFailedMessageGroupRow("Payments failures")?.lastFailed).toBe("2 days ago");
    });

    test("EXAMPLE: The time period of when the group was last retried should be shown", async ({ driver }) => {
      await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures", options: { lastRetriedDaysAgo: 3 } }]);

      expect(getFailedMessageGroupRow("Payments failures")?.lastRetried).toBe("3 days ago");
    });

    test("EXAMPLE: A deleted message group that has not been retried should show N/A for the last retry time", async ({ driver }) => {
      await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures" }]);

      expect(getFailedMessageGroupRow("Payments failures")?.lastRetried).toMatch(/n\/a/i);
    });
  });

  describe("RULE: Ability to select a given group should be hinted ", () => {
    test("EXAMPLE: Hovering the cursor over a group should indicate that it is active and selectable", async ({ driver }) => {
      await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures", options: { count: 3 } }]);

      const before = getFailedMessageGroupRow("Payments failures");
      expect(before?.isHovered).toBe(false);
      expect(before?.hasHoverCue).toBe(false);

      await hoverFailedMessageGroup("Payments failures");

      const row = getFailedMessageGroupRow("Payments failures");
      expect(row?.isHovered).toBe(true);
      expect(row?.hasHoverCue).toBe(true);
      expect(row?.isSelectable).toBe(true);
    });
  });

  describe("RULE: Routing should place routes in browser history", () => {
    test("EXAMPLE: Navigating away from and then back to a detail view should return to the same detail view", async ({ driver }) => {
      await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures" }]);

      await selectFailedMessageGroup("Payments failures");
      await waitFor(() => expect(currentRoute()).toBe(routeLinks.failedMessage.group.link("group-1")));

      window.history.back();
      await waitFor(() => expect(currentRoute()).toBe(FAILED_MESSAGE_GROUPS));
      await waitFor(() => expect(getFailedMessageGroupRow("Payments failures")).toBeDefined());

      window.history.forward();
      await waitFor(() => expect(currentRoute()).toBe(routeLinks.failedMessage.group.link("group-1")));
    });

    test("EXAMPLE: Forward and backward navigation should navigate through the selected tabs in order", async ({ driver }) => {
      await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures" }]);

      await openTab("All Failed Messages");
      await waitFor(() => expect(currentRoute()).toBe(ALL_FAILED_MESSAGES));
      await openTab("Deleted Message Groups");
      await waitFor(() => expect(currentRoute()).toBe(DELETED_MESSAGE_GROUPS));

      window.history.back();
      await waitFor(() => expect(currentRoute()).toBe(ALL_FAILED_MESSAGES));
      window.history.back();
      await waitFor(() => expect(currentRoute()).toBe(FAILED_MESSAGE_GROUPS));

      window.history.forward();
      await waitFor(() => expect(currentRoute()).toBe(ALL_FAILED_MESSAGES));
      window.history.forward();
      await waitFor(() => expect(currentRoute()).toBe(DELETED_MESSAGE_GROUPS));
    });
  });

  describe("RULE: Selected Grouping and Sort Order should remain selected when returning to Failed Message Groups tab", () => {
    test("EXAMPLE: The selected grouping and sorting should be restored when returning to the tab", async ({ driver }) => {
      const bed = await givenFailedMessageGroupsAreShown(driver, [
        { title: "Billing failures", options: { count: 1 } },
        { title: "Payments failures", options: { count: 5 } },
        { title: "Shipping failures", options: { count: 3 } },
      ]);

      await selectGrouping("Message Type");
      await selectSort(/^number of messages\s*\(descending\)$/i);

      await openTab("All Failed Messages");
      await waitFor(() => expect(currentRoute()).toBe(ALL_FAILED_MESSAGES));
      await openTab("Failed Message Groups");
      await waitFor(() => expect(getFailedMessageGroupRowCount()).toBe(3), { timeout: 5000 });

      expect(selectedGrouping()).toBe("Message Type");
      expect(selectedSort()).toBe("Number of messages (Descending)");
      await waitFor(() => expect(bed.requestedClassifiers.at(-1)).toBe("Message Type"));
      await waitFor(() => expect(getFailedMessageGroupRows().map((row) => row.title)).toEqual(["Payments failures", "Shipping failures", "Billing failures"]));
    });
  });

  describe("RULE: Completed group retry requests should be listed on the Failed Message Groups tab", () => {
    test("EXAMPLE: The list of completed retry requests should be collapsed by default", async ({ driver }) => {
      await givenCompletedRetryRequests(driver, [precondition.createHistoricRetryOperation("request-1"), precondition.createHistoricRetryOperation("request-2")]);

      expect(isCompletedRetryRequestsListExpanded()).toBe(false);
      expect(getCompletedRetryRequestRows().every((row) => !row.isVisible)).toBe(true);
    });

    test("EXAMPLE: Selecting the heading should expand and then collapse the list of completed retry requests", async ({ driver }) => {
      await givenCompletedRetryRequests(driver, [precondition.createHistoricRetryOperation("request-1")]);

      await toggleCompletedRetryRequests();
      expect(isCompletedRetryRequestsListExpanded()).toBe(true);
      expect(getCompletedRetryRequestRows().every((row) => row.isVisible)).toBe(true);

      await toggleCompletedRetryRequests();
      expect(isCompletedRetryRequestsListExpanded()).toBe(false);
    });

    test("EXAMPLE: A completed retry request should show the group name, the number of messages sent, and when it started and completed", async ({ driver }) => {
      await givenCompletedRetryRequests(driver, [precondition.createHistoricRetryOperation("request-1", { originator: "Payments failures", messagesSent: 12, startedMinutesAgo: 30, completedMinutesAgo: 20 })]);

      await toggleCompletedRetryRequests();

      expect(getCompletedRetryRequestRows()).toEqual([{ title: "Payments failures", messagesSent: "12", started: "30 minutes ago", completed: "20 minutes ago", isVisible: true }]);
    });

    test("EXAMPLE: A message should be shown when no group retry requests have been completed", async ({ driver }) => {
      await givenCompletedRetryRequests(driver, []);

      await toggleCompletedRetryRequests();

      await waitFor(() => expect(isNoCompletedRetryRequestsMessageVisible()).toBe(true));
      expect(getCompletedRetryRequestRows()).toHaveLength(0);
    });

    [
      { count: 1, summary: "There is only 1 completed group retry" },
      { count: 3, summary: "There are only 3 completed group retries" },
    ].forEach(({ count, summary }) => {
      test(`EXAMPLE: The list should note when there are fewer than ten completed retry requests (${count})`, async ({ driver }) => {
        await givenCompletedRetryRequests(
          driver,
          Array.from({ length: count }, (_, index) => precondition.createHistoricRetryOperation(`request-${index + 1}`))
        );

        await toggleCompletedRetryRequests();

        expect(visibleCompletedRetryRequestsSummary()).toBe(summary);
      });
    });

    test("EXAMPLE: No note should be shown when there are ten completed retry requests", async ({ driver }) => {
      await givenCompletedRetryRequests(
        driver,
        Array.from({ length: 10 }, (_, index) => precondition.createHistoricRetryOperation(`request-${index + 1}`))
      );

      await toggleCompletedRetryRequests();

      expect(getCompletedRetryRequestRows()).toHaveLength(10);
      expect(visibleCompletedRetryRequestsSummary()).toBeNull();
    });
  });

  describe("RULE: The Failed Messages tab headers should show badges for failed and deleted messages", () => {
    test("EXAMPLE: The All Failed Messages tab should show the number of failed messages", async ({ driver }) => {
      await givenFailedMessageCounts(driver, { failed: 7 });

      await waitFor(() => expect(tabBadge("All Failed Messages")).toBe("7"));
    });

    test("EXAMPLE: The All Deleted Messages tab should show the number of deleted messages", async ({ driver }) => {
      await givenFailedMessageCounts(driver, { deleted: 4 });

      await waitFor(() => expect(tabBadge("All Deleted Messages")).toBe("4"));
    });

    test("EXAMPLE: The Failed Message Groups tab should show an indicator when there are failed messages", async ({ driver }) => {
      await givenFailedMessageCounts(driver, { failed: 7 });

      await waitFor(() => expect(tabBadge("Failed Message Groups")).toBe("!"));
    });

    test("EXAMPLE: The Deleted Message Groups tab should show an indicator when there are deleted messages", async ({ driver }) => {
      await givenFailedMessageCounts(driver, { deleted: 4 });

      await waitFor(() => expect(tabBadge("Deleted Message Groups")).toBe("!"));
    });
  });

  describe("RULE: Actions on groups should be conditional on the state of the group", () => {
    test("EXAMPLE: Adding a note should be possible when there are no notes on a group", async ({ driver }) => {
      await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures" }]);

      const row = getFailedMessageGroupRow("Payments failures");
      expect(row?.note).toBeNull();
      expect(row?.actions).toContain("Add note");
    });

    test("EXAMPLE: Editing a note should be possible when there is a note on a group", async ({ driver }) => {
      await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures", options: { comment: "Waiting on the payment provider fix" } }]);

      const row = getFailedMessageGroupRow("Payments failures");
      expect(row?.note).toBe("Waiting on the payment provider fix");
      expect(row?.actions).toContain("Edit note");
      expect(row?.actions).toContain("Remove note");
    });

    test("EXAMPLE: Removing a note should be possible when there is a note on a group", async ({ driver }) => {
      const bed = await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures", options: { comment: "Waiting on the payment provider fix" } }]);

      await clickGroupAction("Payments failures", /remove note/i);
      expect(isConfirmationDialogVisible(DELETE_NOTE_CONFIRMATION)).toBe(true);
      await confirmDialog(DELETE_NOTE_CONFIRMATION);

      await waitFor(() => expect(bed.removedNoteGroupIds).toEqual(["group-1"]));
      await waitFor(() => expect(getFailedMessageGroupRow("Payments failures")?.note).toBeNull());
    });

    test("EXAMPLE: Requesting a retry should be possible when there are failed messages in a group", async ({ driver }) => {
      const bed = await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures", options: { count: 3 } }, { title: "Shipping failures" }]);

      await clickGroupAction("Payments failures", /request retry/i);
      expect(isConfirmationDialogVisible(RETRY_GROUP_CONFIRMATION)).toBe(true);
      await confirmDialog(RETRY_GROUP_CONFIRMATION);

      await waitFor(() => expect(bed.retriedGroupIds).toEqual(["group-1"]));
      await waitFor(() => expect(getFailedMessageGroupRow("Payments failures")).toBeUndefined(), { timeout: 5000 });
      expect(getFailedMessageGroupRow("Shipping failures")).toBeDefined();
    });

    test("EXAMPLE: Deleting a group should be possible when there are failed messages in a group", async ({ driver }) => {
      const bed = await givenFailedMessageGroupsAreShown(driver, [{ title: "Payments failures", options: { count: 3 } }]);

      await clickGroupAction("Payments failures", /delete group/i);
      expect(isConfirmationDialogVisible(DELETE_GROUP_CONFIRMATION)).toBe(true);
      await confirmDialog(DELETE_GROUP_CONFIRMATION);

      await waitFor(() => expect(bed.deletedGroupIds).toEqual(["group-1"]));
      await waitFor(
        () => {
          expect(isDeleteCompletedVisible()).toBe(true);
          expect(isDismissButtonVisible()).toBe(true);
        },
        { timeout: 5000 }
      );
    });
  });
});
