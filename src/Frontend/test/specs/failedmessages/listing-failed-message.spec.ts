import { expect } from "vitest";
import { waitFor } from "@testing-library/vue";
import { test, describe } from "../../drivers/vitest/driver";
import type { Driver } from "../../driver";
import * as precondition from "../../preconditions";
import type { FailedMessageGroup, FailedMessagesTestBed } from "../../preconditions/failedMessages";
import type { FailedMessage } from "@/resources/FailedMessage";
import routeLinks from "@/router/routeLinks";
import { getFailedMessageRowCount, getFailedMessageRow, isFailedMessageListed, isRetryInProgress, listedMessageIds } from "./questions/failedMessageRows";
import {
  allFailedMessagesTabBadge,
  browserTabTitle,
  deleteSelectedText,
  exportSelectedText,
  failedMessagesNavBadge,
  groupHeading,
  groupMessageCount,
  isEmptyMessageVisible,
  isDeleteSelectedDisabled,
  isExportSelectedDisabled,
  isRetrySelectedDisabled,
  isSelectionButtonDisabled,
  isTabActive,
  retrySelectedText,
  selectionButtonText,
} from "./questions/failedMessagesView";
import { clearFailedMessageSelection, selectAllFailedMessages, selectFailedMessage } from "./actions/failedMessageSelection";
import { hoverFailedMessage } from "./actions/hoverFailedMessage";
import { openTab } from "./actions/openTab";
import { requestRetryFor } from "./actions/requestRetry";
import { sortBy, sortByDescending } from "./actions/sortFailedMessages";

const ALL_FAILED_MESSAGES = routeLinks.failedMessage.failedMessages.link;
const FAILED_MESSAGE_GROUPS = routeLinks.failedMessage.failedMessagesGroups.link;
const GROUP_ONE = "group-1";
const GROUP_TWO = "group-2";
const GROUP_ONE_TITLE = "Payments Group";

function failedMessagesFixture() {
  return {
    oldest: precondition.createFailedMessage("msg-1", { messageType: "Sales.Third", failedHoursAgo: 8 }),
    middle: precondition.createFailedMessage("msg-2", { messageType: "Sales.First", failedHoursAgo: 4, retryFailures: 2, exceptionMessage: "Payment gateway timed out" }),
    newest: precondition.createFailedMessage("msg-3", { messageType: "Sales.Second", failedHoursAgo: 1 }),
  };
}

function asList(fixture: Partial<ReturnType<typeof failedMessagesFixture>>): FailedMessage[] {
  return Object.values(fixture).filter((message): message is FailedMessage => message !== undefined);
}

async function givenFailedMessagesAreShown(driver: Driver, messages: FailedMessage[]): Promise<FailedMessagesTestBed> {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  const bed = await driver.setUp(precondition.hasFailedMessages({ messages }));
  await driver.goTo(ALL_FAILED_MESSAGES);
  await waitFor(() => expect(getFailedMessageRowCount()).toBe(messages.length), { timeout: 5000 });
  return bed;
}

async function givenFailedMessagesInAPaymentsGroupAreShown(driver: Driver): Promise<FailedMessagesTestBed> {
  const fixture = failedMessagesFixture();
  const groups: FailedMessageGroup[] = [
    { id: GROUP_ONE, title: GROUP_ONE_TITLE, messageIds: [fixture.oldest.id, fixture.middle.id] },
    { id: GROUP_TWO, title: "Shipping Group", messageIds: [fixture.newest.id] },
  ];

  await driver.setUp(precondition.serviceControlWithMonitoring);
  const bed = await driver.setUp(precondition.hasFailedMessages({ messages: asList(fixture), groups }));
  await driver.goTo(routeLinks.failedMessage.group.link(GROUP_ONE));
  await waitFor(() => expect(getFailedMessageRowCount()).toBe(groups[0].messageIds.length), { timeout: 5000 });
  return bed;
}

describe("FEATURE: All Failed Messages", () => {
  describe("RULE: All failed messages view should show an unfiltered list", () => {
    test("EXAMPLE: All failed messages tab should be highlighted as active", async ({ driver }) => {
      await givenFailedMessagesAreShown(driver, asList(failedMessagesFixture()));

      expect(isTabActive("All Failed Messages")).toBe(true);
    });

    test("EXAMPLE: Browser tab title should show 'All Failed Messages'", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasFailedMessages({ messages: asList(failedMessagesFixture()) }));
      await driver.goTo(FAILED_MESSAGE_GROUPS);

      await openTab("All Failed Messages");

      await waitFor(() => expect(browserTabTitle()).toBe("All Failed Messages • ServicePulse"));
    });

    test("EXAMPLE: Failed messages should be ordered by failure time by default", async ({ driver }) => {
      const { oldest, middle, newest } = failedMessagesFixture();
      await givenFailedMessagesAreShown(driver, asList({ oldest, middle, newest }));

      expect(listedMessageIds()).toEqual([newest.id, middle.id, oldest.id]);
    });

    test("EXAMPLE: Failed messages should be ordered according to the selected sort by field", async ({ driver }) => {
      const { oldest, middle, newest } = failedMessagesFixture();
      await givenFailedMessagesAreShown(driver, asList({ oldest, middle, newest }));

      await sortBy("Message Type");
      await waitFor(() => expect(listedMessageIds()).toEqual([middle.id, newest.id, oldest.id]), { timeout: 5000 }); //Sales.First, Sales.Second, Sales.Third

      await sortByDescending("Message Type");
      await waitFor(() => expect(listedMessageIds()).toEqual([oldest.id, newest.id, middle.id]), { timeout: 5000 });
    });

    test("EXAMPLE: A failed message should display the current message name in bold", async ({ driver }) => {
      const { middle } = failedMessagesFixture();
      await givenFailedMessagesAreShown(driver, asList({ middle }));

      const row = getFailedMessageRow(middle.id);
      expect(row?.messageType).toBe("Sales.First");
      expect(row?.messageTypeIsBold).toBe(true);
    });

    test("EXAMPLE: A failed message should display a time period indicating how long ago the failure happened", async ({ driver }) => {
      const { middle } = failedMessagesFixture();
      await givenFailedMessagesAreShown(driver, asList({ middle }));

      expect(getFailedMessageRow(middle.id)?.failedSince).toBe("4 hours ago");
    });

    test("EXAMPLE: A failed message should display the name of the Endpoint that the message failed on", async ({ driver }) => {
      const { middle } = failedMessagesFixture();
      await givenFailedMessagesAreShown(driver, asList({ middle }));

      expect(getFailedMessageRow(middle.id)?.endpoint).toBe("Sales.Service");
    });

    test("EXAMPLE: A failed message should display the name of the Machine that the message failed on", async ({ driver }) => {
      const { middle } = failedMessagesFixture();
      await givenFailedMessagesAreShown(driver, asList({ middle }));

      expect(getFailedMessageRow(middle.id)?.machine).toBe("MACHINE-B");
    });

    test("EXAMPLE: A failed message should display the exception message text", async ({ driver }) => {
      const { middle } = failedMessagesFixture();
      await givenFailedMessagesAreShown(driver, asList({ middle }));

      expect(getFailedMessageRow(middle.id)?.exceptionMessage).toBe("Payment gateway timed out");
    });

    test("EXAMPLE: A failed message should display the number of times it has failed retries", async ({ driver }) => {
      const { middle } = failedMessagesFixture();
      await givenFailedMessagesAreShown(driver, asList({ middle }));

      const row = getFailedMessageRow(middle.id);
      expect(row?.retryFailures).toBe("2 Retry Failures"); //1 less than the 3 processing attempts recorded for the message
      expect(row?.retryFailuresAreEmphasised).toBe(true);
    });

    test("EXAMPLE: A message should be shown when there are no failed messages", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasFailedMessages({}));
      await driver.goTo(ALL_FAILED_MESSAGES);

      await waitFor(() => expect(isEmptyMessageVisible()).toBe(true), { timeout: 5000 });
    });
  });

  describe("RULE: Failed messages (group route) view should only show failed messages associated with that group", () => {
    test("EXAMPLE: Only messages of a selected group should be shown", async ({ driver }) => {
      await givenFailedMessagesInAPaymentsGroupAreShown(driver);

      expect(listedMessageIds().sort()).toEqual(["msg-1", "msg-2"]);
      expect(isFailedMessageListed("msg-3")).toBe(false);
    });

    test("EXAMPLE: Group name should be shown as a heading", async ({ driver }) => {
      await givenFailedMessagesInAPaymentsGroupAreShown(driver);

      expect(groupHeading()).toBe(GROUP_ONE_TITLE);
    });

    test("EXAMPLE: Group message count should be shown as a subtext to the group heading", async ({ driver }) => {
      await givenFailedMessagesInAPaymentsGroupAreShown(driver);

      expect(groupMessageCount()).toBe("2 messages in group");
    });

    test("EXAMPLE: Failed Message Groups tab should remain highlighted as active", async ({ driver }) => {
      await givenFailedMessagesInAPaymentsGroupAreShown(driver);

      expect(isTabActive("Failed Message Groups")).toBe(true);
    });
  });

  describe("RULE: Row hover functionality", () => {
    test("EXAMPLE: Hovering the cursor over a failed message row should indicate that it is active, selectable, and show the 'Request Retry' action", async ({ driver }) => {
      const { middle } = failedMessagesFixture();
      await givenFailedMessagesAreShown(driver, asList({ middle }));

      expect(getFailedMessageRow(middle.id)?.isRequestRetryActionVisible).toBe(false);

      await hoverFailedMessage(middle.id);

      const row = getFailedMessageRow(middle.id);
      expect(row?.isHovered).toBe(true);
      expect(row?.isSelectable).toBe(true);
      expect(row?.isRequestRetryActionVisible).toBe(true);
    });
  });

  describe('RULE: The badge counter on the "All Failed Messages" tab header and the "Failed messages" main navigation items should reflect the total count of failed messages', () => {
    test("EXAMPLE: The tab and navigation badges show the total number of failed messages", async ({ driver }) => {
      await givenFailedMessagesAreShown(driver, asList(failedMessagesFixture()));

      await waitFor(() => expect(allFailedMessagesTabBadge()).toBe("3"), { timeout: 5000 });
      await waitFor(() => expect(failedMessagesNavBadge()).toBe("3"), { timeout: 5000 });
    });
  });

  describe("RULE: action functionality", () => {
    test("EXAMPLE: Clicking the 'Request Retry' action should initiate a retry for the selected message", async ({ driver }) => {
      const { middle } = failedMessagesFixture();
      const bed = await givenFailedMessagesAreShown(driver, asList({ middle }));

      await requestRetryFor(middle.id);

      await waitFor(() => expect(bed.retriedIds).toEqual([middle.id]), { timeout: 5000 });
      await waitFor(() => expect(isRetryInProgress(middle.id)).toBe(true), { timeout: 5000 });
      await waitFor(() => expect(isFailedMessageListed(middle.id)).toBe(false), { timeout: 10000 });
    });
  });

  describe("RULE: button functionality", () => {
    test("EXAMPLE: When no Failed Message rows are selected, the 'Select All' button should be enabled", async ({ driver }) => {
      await givenFailedMessagesAreShown(driver, asList(failedMessagesFixture()));

      expect(selectionButtonText()).toBe("Select all");
      expect(isSelectionButtonDisabled()).toBe(false);
    });

    test("EXAMPLE: When no Failed Message rows are selected, the 'Retry Selected' button should be disabled", async ({ driver }) => {
      await givenFailedMessagesAreShown(driver, asList(failedMessagesFixture()));

      expect(retrySelectedText()).toBe("Retry 0 selected");
      expect(isRetrySelectedDisabled()).toBe(true);
    });

    test("EXAMPLE: When no Failed Message rows are selected, the 'Delete Selected' button should be disabled", async ({ driver }) => {
      await givenFailedMessagesAreShown(driver, asList(failedMessagesFixture()));

      expect(deleteSelectedText()).toBe("Delete 0 selected");
      expect(isDeleteSelectedDisabled()).toBe(true);
    });

    test("EXAMPLE: When no Failed Message rows are selected, the 'Export Selected' button should be disabled", async ({ driver }) => {
      await givenFailedMessagesAreShown(driver, asList(failedMessagesFixture()));

      expect(exportSelectedText()).toBe("Export 0 selected");
      expect(isExportSelectedDisabled()).toBe(true);
    });

    test("EXAMPLE: When 1 or more Failed Message rows are selected, the 'Select All' button should be replaced by a 'Clear Selection' button", async ({ driver }) => {
      await givenFailedMessagesAreShown(driver, asList(failedMessagesFixture()));

      await selectFailedMessage("msg-2");

      expect(selectionButtonText()).toBe("Clear selection");
    });

    test("EXAMPLE: When 1 or more Failed Message rows are selected, the 'Retry Selected' button should indicate the number of rows selected and be enabled", async ({ driver }) => {
      await givenFailedMessagesAreShown(driver, asList(failedMessagesFixture()));

      await selectAllFailedMessages();

      expect(retrySelectedText()).toBe("Retry 3 selected");
      expect(isRetrySelectedDisabled()).toBe(false);
    });

    test("EXAMPLE: When 1 or more Failed Message rows are selected, the 'Delete Selected' button should indicate the number of rows selected and be enabled", async ({ driver }) => {
      await givenFailedMessagesAreShown(driver, asList(failedMessagesFixture()));

      await selectAllFailedMessages();

      expect(deleteSelectedText()).toBe("Delete 3 selected");
      expect(isDeleteSelectedDisabled()).toBe(false);
    });

    test("EXAMPLE: When 1 or more Failed Message rows are selected, the 'Export Selected' button should indicate the number of rows selected and be enabled", async ({ driver }) => {
      await givenFailedMessagesAreShown(driver, asList(failedMessagesFixture()));

      await selectAllFailedMessages();

      expect(exportSelectedText()).toBe("Export 3 selected");
      expect(isExportSelectedDisabled()).toBe(false);
    });

    test("EXAMPLE: Clearing the selection should restore the unselected button state", async ({ driver }) => {
      await givenFailedMessagesAreShown(driver, asList(failedMessagesFixture()));
      await selectAllFailedMessages();

      await clearFailedMessageSelection();

      expect(selectionButtonText()).toBe("Select all");
      expect(isRetrySelectedDisabled()).toBe(true);
      expect(isDeleteSelectedDisabled()).toBe(true);
      expect(isExportSelectedDisabled()).toBe(true);
    });
  });
});
