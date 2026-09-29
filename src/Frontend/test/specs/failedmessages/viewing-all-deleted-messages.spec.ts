import { expect } from "vitest";
import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";
import routeLinks from "@/router/routeLinks";
import type { Driver } from "../../driver";
import type { DeletedMessageGroup, DeletedMessagesTestBed } from "../../preconditions/deletedMessages";
import type { FailedMessage } from "@/resources/FailedMessage";
import { getDeletedMessageRowCount, getDeletedMessageRow, isDeletedMessageListed } from "./questions/deletedMessageRows";
import { browserTabTitle, groupHeading, groupMessageCount, isEmptyMessageVisible, isRestoreButtonDisabled, isRestoreConfirmationVisible, isTabActive, restoreButtonText, selectionButtonText } from "./questions/deletedMessagesView";
import { clearDeletedMessageSelection, selectAllDeletedMessages, selectDeletedMessage } from "./actions/deletedMessageSelection";
import { clickRestoreSelected, confirmRestoreSelected, restoreMessage } from "./actions/restoreDeletedMessages";
import { openTab } from "./actions/openTab";

const ALL_DELETED_MESSAGES = routeLinks.failedMessage.deletedMessages.link;
const DELETED_MESSAGE_GROUPS = routeLinks.failedMessage.deletedMessagesGroup.link;
const PAYMENTS_GROUP: DeletedMessageGroup = { id: "group-payments", title: "Payments failures", messageIds: ["msg-2"] };
const DELETED_PAYMENTS_GROUP = routeLinks.failedMessage.deletedGroup.link(PAYMENTS_GROUP.id);

async function givenDeletedMessagesAreShown(driver: Driver, messages: FailedMessage[]): Promise<DeletedMessagesTestBed> {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  const bed = await driver.setUp(precondition.hasDeletedMessages({ messages }));
  await driver.goTo(ALL_DELETED_MESSAGES);
  await waitFor(() => expect(getDeletedMessageRowCount()).toBe(messages.length), { timeout: 5000 });
  return bed;
}

async function givenDeletedMessagesInAPaymentsGroupAreShown(driver: Driver): Promise<DeletedMessagesTestBed> {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  const bed = await driver.setUp(
    precondition.hasDeletedMessages({
      messages: [precondition.createDeletedMessage("msg-1"), precondition.createDeletedMessage("msg-2"), precondition.createDeletedMessage("msg-3")],
      groups: [PAYMENTS_GROUP],
    })
  );
  await driver.goTo(DELETED_PAYMENTS_GROUP);
  await waitFor(() => expect(getDeletedMessageRowCount()).toBe(PAYMENTS_GROUP.messageIds.length), { timeout: 5000 });
  return bed;
}

describe("FEATURE: All Deleted Messages", () => {
  describe("RULE: All deleted messages view should show an unfiltered list", () => {
    test("EXAMPLE: All deleted messages tab should be highlighted as active", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1")]);

      expect(isTabActive("All Deleted Messages")).toBe(true);
    });

    test("EXAMPLE: Browser tab title should show 'All Deleted Messages'", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasDeletedMessages({ messages: [precondition.createDeletedMessage("msg-1")] }));
      await driver.goTo(DELETED_MESSAGE_GROUPS);

      await openTab("All Deleted Messages");

      await waitFor(() => expect(browserTabTitle()).toBe("All Deleted Messages • ServicePulse"));
    });

    test("EXAMPLE: A deleted message should display the current message name in bold", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1", { messageType: "Sales.OrderFailed" })]);

      const row = getDeletedMessageRow("msg-1");
      expect(row?.messageType).toBe("Sales.OrderFailed");
      expect(row?.messageTypeIsBold).toBe(true);
    });

    test("EXAMPLE: A deleted message should display a time period indicating how long ago the failure happened", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1", { failedDaysAgo: 3 })]);

      expect(getDeletedMessageRow("msg-1")?.failedSince).toBe("3 days ago");
    });

    test("EXAMPLE: A deleted message should display the name of the Endpoint that the message failed on", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1", { endpoint: "Billing.Service" })]);

      expect(getDeletedMessageRow("msg-1")?.endpoint).toBe("Billing.Service");
    });

    test("EXAMPLE: A deleted message should display the name of the Machine that the message failed on", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1", { machine: "MACHINE-C" })]);

      expect(getDeletedMessageRow("msg-1")?.machine).toBe("MACHINE-C");
    });

    test("EXAMPLE: A deleted message should display a time period indicating how long ago it was deleted", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1", { deletedMinutesAgo: 20 })]);

      expect(getDeletedMessageRow("msg-1")?.deletedSince).toBe("20 minutes ago");
    });

    test("EXAMPLE: A deleted message should display, in a prominent style, a time period indicating when the message is scheduled for hard deletion", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasErrorRetentionPeriod("00.00:00:00"));
      await driver.setUp(precondition.hasDeletedMessages({ messages: [precondition.createDeletedMessage("msg-1")] }));
      await driver.goTo(ALL_DELETED_MESSAGES);

      await waitFor(() => expect(getDeletedMessageRow("msg-1")?.scheduledForDeletion).toBe("immediately"));
      expect(getDeletedMessageRow("msg-1")?.deletionIsUrgent).toBe(true);
    });

    test("EXAMPLE: A deleted message should display the exception message text", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1", { exceptionMessage: "Sequence contains no elements" })]);

      expect(getDeletedMessageRow("msg-1")?.exceptionMessage).toBe("Sequence contains no elements");
    });

    test("EXAMPLE: A deleted message should display the number of times it has failed retries", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1", { retryFailures: 2 })]);

      const row = getDeletedMessageRow("msg-1");
      expect(row?.retryFailures).toBe("2 Retry Failures");
      expect(row?.retryFailuresAreEmphasised).toBe(true);
    });

    test("EXAMPLE: A message should be shown when there are no deleted messages", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasDeletedMessages({ messages: [] }));
      await driver.goTo(ALL_DELETED_MESSAGES);

      await waitFor(() => expect(isEmptyMessageVisible()).toBe(true));
      expect(getDeletedMessageRowCount()).toBe(0);
    });
  });

  describe("RULE: Deleted messages (group route) view should only show deleted messages associated with that group", () => {
    test("EXAMPLE: Only messages of a selected group should be shown", async ({ driver }) => {
      await givenDeletedMessagesInAPaymentsGroupAreShown(driver);

      expect(isDeletedMessageListed("msg-2")).toBe(true);
      expect(isDeletedMessageListed("msg-1")).toBe(false);
      expect(isDeletedMessageListed("msg-3")).toBe(false);
    });

    test("EXAMPLE: Group name should be shown as a heading", async ({ driver }) => {
      await givenDeletedMessagesInAPaymentsGroupAreShown(driver);

      expect(groupHeading()).toBe("Payments failures");
    });

    test("EXAMPLE: Group message count should be shown as a subtext to the group heading", async ({ driver }) => {
      await givenDeletedMessagesInAPaymentsGroupAreShown(driver);

      expect(groupMessageCount()).toBe("1 messages in group");
    });

    test("EXAMPLE: Deleted Message Groups tab should remain highlighted as active", async ({ driver }) => {
      await givenDeletedMessagesInAPaymentsGroupAreShown(driver);

      expect(isTabActive("Deleted Message Groups")).toBe(true);
      expect(isTabActive("All Deleted Messages")).toBe(false);
    });
  });

  describe("RULE: button functionality", () => {
    test("EXAMPLE: Selecting a row should enable the 'Restore Selected' button", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1"), precondition.createDeletedMessage("msg-2")]);

      expect(isRestoreButtonDisabled()).toBe(true);
      expect(restoreButtonText()).toBe("Restore 0 selected");

      await selectDeletedMessage("msg-1");

      expect(isRestoreButtonDisabled()).toBe(false);
      expect(restoreButtonText()).toBe("Restore 1 selected");
    });

    test("EXAMPLE: Selecting all rows should enable the 'Restore Selected' button", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1"), precondition.createDeletedMessage("msg-2")]);

      expect(selectionButtonText()).toBe("Select all");

      await selectAllDeletedMessages();

      expect(selectionButtonText()).toBe("Clear selection");
      expect(restoreButtonText()).toBe("Restore 2 selected");
      expect(isRestoreButtonDisabled()).toBe(false);
    });

    test("EXAMPLE: Clearing the selection should disable the 'Restore Selected' button again", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1"), precondition.createDeletedMessage("msg-2")]);
      await selectAllDeletedMessages();

      await clearDeletedMessageSelection();

      expect(selectionButtonText()).toBe("Select all");
      expect(isRestoreButtonDisabled()).toBe(true);
    });

    test("EXAMPLE: Clicking the 'Restore Selected' button should show an action confirmation modal", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1")]);
      await selectDeletedMessage("msg-1");

      await clickRestoreSelected();

      expect(isRestoreConfirmationVisible()).toBe(true);
    });

    test("EXAMPLE: Clicking 'Yes' on the action confirmation modal should restore the message", async ({ driver }) => {
      const bed = await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1"), precondition.createDeletedMessage("msg-2")]);

      await selectDeletedMessage("msg-1");
      await clickRestoreSelected();
      await confirmRestoreSelected();

      await waitFor(() => expect(bed.restoredIds).toEqual(["msg-1"]));
    });

    test("EXAMPLE: The list should refresh with the restored message removed", async ({ driver }) => {
      await givenDeletedMessagesAreShown(driver, [precondition.createDeletedMessage("msg-1"), precondition.createDeletedMessage("msg-2")]);

      await restoreMessage("msg-1");

      await waitFor(() => expect(isDeletedMessageListed("msg-1")).toBe(false), { timeout: 5000 });
      expect(isDeletedMessageListed("msg-2")).toBe(true);
    });
  });
});
