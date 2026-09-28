import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { expect } from "vitest";
import { waitFor } from "@testing-library/vue";
import dayjs from "@/utils/dayjs";
import { FailedMessageStatus } from "@/resources/FailedMessage";
import { selectFailedMessageGroup } from "./actions/selectFailedMessageGroup";
import { getFailedMessagesView } from "./questions/getFailedMessagesView";
import { getMessageView } from "./questions/getMessageView";

const groupId = "81dca64e-76fc-e1c3-11a2-3069f51c58c8";
const messageId = "40134401-bab9-41aa-9acb-b19c0066f22d";
const messageType = "ServiceControl.SmokeTest.SimpleCommand";

describe("FEATURE: Viewing the details of a message group", () => {
  describe("RULE: Viewing the details of a Failed message group should be possible", () => {
    const failedMessage = precondition.hasFailedMessage({
      withGroupId: groupId,
      withMessageId: messageId,
      withContentType: "application/json",
      withBody: { Index: 0, Data: "" },
    });

    test("EXAMPLE: Selecting a group from the failed messages view should show all messages associated with that group", async ({ driver }) => {
      // Given there are 1 or more groups shown in the "Failed Message Groups" tab
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(failedMessage);
      await driver.goTo("/failed-messages/failed-message-groups");

      // When a group is selected
      await selectFailedMessageGroup("Endpoint1");

      // Then all messages associated with that group should be shown in the Failed Messages view
      const failedMessagesView = getFailedMessagesView();
      expect(await failedMessagesView.messageTypes()).toEqual([messageType]);
    });

    test("EXAMPLE: The group heading should be the group name of the group that was selected", async ({ driver }) => {
      // Given there are 1 or more groups shown in the "Failed Message Groups" tab
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(failedMessage);
      await driver.goTo("/failed-messages/failed-message-groups");

      // When a group is selected
      await selectFailedMessageGroup("Endpoint1");

      // Then the group heading should be the group name of the group that was selected
      const failedMessagesView = getFailedMessagesView();
      expect(await failedMessagesView.groupHeading("Endpoint1")).toBeInTheDocument();
    });

    test("EXAMPLE: The browser tab title should show 'Failed Messages', not 'All Failed Messages'", async ({ driver }) => {
      // Given there are 1 or more groups shown in the "Failed Message Groups" tab
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(failedMessage);
      await driver.goTo("/failed-messages/failed-message-groups");

      // When a group is selected
      await selectFailedMessageGroup("Endpoint1");

      // Then the browser tab title should show "Failed Messages", not "All Failed Messages"
      await waitFor(() => expect(document.title).toBe("Failed Messages • ServicePulse"));
    });
  });
});

describe("FEATURE: Message View", () => {
  describe("RULE: Error scenarios should be handled gracefully", () => {
    test("EXAMPLE: When no data is returned for a message, text should be shown indicating that the message could not be found", async ({ driver }) => {
      // Given no data is returned from ServiceControl for a message id
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasFailedMessageNotFound({ withId: groupId }));

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then a text will be shown indicating that the message could not be found
      const messageView = getMessageView();
      expect(await messageView.notice(/could not find message/i)).toBeInTheDocument();
    });

    [
      { errorType: "an error response", networkError: false },
      { errorType: "a network error", networkError: true },
    ].forEach(({ errorType, networkError }) => {
      test(`EXAMPLE: When an error is returned for a message, text should be shown indicating that an error occurred (${errorType})`, async ({ driver }) => {
        // Given an error is returned from ServiceControl for a message id
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.hasFailedMessageRetrievalError({ withId: groupId, networkError }));

        // When the message view is shown
        await driver.goTo(`/messages/${groupId}`);

        // Then a text will be shown indicating that an error occured and to investigate ServiceControl logs for the reason
        const messageView = getMessageView();
        expect(await messageView.notice(/an error occurred while trying to load the message\. please check the servicecontrol logs/i)).toBeInTheDocument();
      });
    });
  });

  describe("RULE: Header should show meta information and action buttons for a message that has not been deleted", () => {
    const failedMessage = precondition.hasFailedMessage({
      withGroupId: groupId,
      withMessageId: messageId,
      withContentType: "application/json",
      withBody: { Index: 0, Data: "" },
      withTimeOfFailure: dayjs.utc().subtract(2, "hours").toISOString(),
    });

    test("EXAMPLE: Message name should be displayed as a heading", async ({ driver }) => {
      // Given the message is not deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(failedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the view header will display the message name as a heading
      const messageView = getMessageView();
      expect(await messageView.heading(messageType)).toBeInTheDocument();
    });

    test("EXAMPLE: Time period indicating how long ago the failure happened should be displayed", async ({ driver }) => {
      // Given the message is not deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(failedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display a time period indicating how long ago the failure happened
      const messageView = getMessageView();
      expect(await messageView.metadataItem("Failed:")).toHaveTextContent("Failed: 2 hours ago");
    });

    test("EXAMPLE: Name of the Endpoint that the message failed on should be displayed", async ({ driver }) => {
      // Given the message is not deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(failedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display the name of the Endpoint that the message failed on
      const messageView = getMessageView();
      expect(await messageView.metadataItem("Endpoint:")).toHaveTextContent("Endpoint: Endpoint1");
    });

    test("EXAMPLE: Name of the Machine that the message failed on should be displayed", async ({ driver }) => {
      // Given the message is not deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(failedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display the name of the Machine that the message failed on
      const messageView = getMessageView();
      expect(await messageView.metadataItem("Machine:")).toHaveTextContent("Machine: mobvm2");
    });

    test("EXAMPLE: Delete message button should be displayed", async ({ driver }) => {
      // Given the message is not deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(failedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display a "Delete message" button
      const messageView = getMessageView();
      expect(await messageView.actionButton("Delete message")).toBeInTheDocument();
    });

    test("EXAMPLE: Retry message button should be displayed", async ({ driver }) => {
      // Given the message is not deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(failedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display a "Retry message" button
      const messageView = getMessageView();
      expect(await messageView.actionButton("Retry message")).toBeInTheDocument();
    });

    test("EXAMPLE: Export message button should be displayed", async ({ driver }) => {
      // Given the message is not deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(failedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display an "Export message" button
      const messageView = getMessageView();
      expect(await messageView.actionButton("Export message")).toBeInTheDocument();
    });
  });

  describe("RULE: Header should show meta information and action buttons for a message that has been deleted", () => {
    const deletedMessage = precondition.hasFailedMessage({
      withGroupId: groupId,
      withMessageId: messageId,
      withContentType: "application/json",
      withBody: { Index: 0, Data: "" },
      withStatus: FailedMessageStatus.Archived,
      withTimeOfFailure: dayjs.utc().subtract(2, "hours").toISOString(),
      withLastModified: dayjs.utc().subtract(1, "hour").toISOString(),
    });

    test("EXAMPLE: Message name should be displayed as a heading", async ({ driver }) => {
      // Given the message is deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(deletedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the view header will display the message name as a heading
      const messageView = getMessageView();
      expect(await messageView.heading(messageType)).toBeInTheDocument();
    });

    test("EXAMPLE: Header should display prominently that the message is deleted", async ({ driver }) => {
      // Given the message is deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(deletedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display prominently that the message is deleted
      const messageView = getMessageView();
      expect(await messageView.statusLabel("Deleted")).toHaveClass("label-warning");
    });

    test("EXAMPLE: Time period indicating how long ago the failure happened should be displayed", async ({ driver }) => {
      // Given the message is deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(deletedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display a time period indicating how long ago the failure happened
      const messageView = getMessageView();
      expect(await messageView.metadataItem("Failed:")).toHaveTextContent("Failed: 2 hours ago");
    });

    test("EXAMPLE: Name of the Endpoint that the message failed on should be displayed", async ({ driver }) => {
      // Given the message is deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(deletedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display the name of the Endpoint that the message failed on
      const messageView = getMessageView();
      expect(await messageView.metadataItem("Endpoint:")).toHaveTextContent("Endpoint: Endpoint1");
    });

    test("EXAMPLE: Name of the Machine that the message failed on should be displayed", async ({ driver }) => {
      // Given the message is deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(deletedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display the name of the Machine that the message failed on
      const messageView = getMessageView();
      expect(await messageView.metadataItem("Machine:")).toHaveTextContent("Machine: mobvm2");
    });

    test("EXAMPLE: Time period indicating how long ago the message was deleted should be displayed", async ({ driver }) => {
      // Given the message is deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(deletedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display a time period indicating how long ago the messsage was deleted
      const messageView = getMessageView();
      expect(await messageView.metadataItem("Deleted:")).toHaveTextContent("Deleted: an hour ago");
    });

    test("EXAMPLE: Time period indicating when the messages is schedule for hard deletion should be displayed prominently", async ({ driver }) => {
      // Given the message is deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(deletedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display, in a prominent style, a time period indicating when the messages is schedule for hard deletion
      const messageView = getMessageView();
      const scheduledForDeletion = await messageView.metadataItem("Scheduled for permanent deletion:");
      await waitFor(() => expect(scheduledForDeletion).toHaveTextContent("Scheduled for permanent deletion: in a month"));
      expect(scheduledForDeletion).toHaveClass("danger");
    });

    test("EXAMPLE: Restore button should be displayed", async ({ driver }) => {
      // Given the message is deleted
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(deletedMessage);

      // When the message view is shown
      await driver.goTo(`/messages/${groupId}`);

      // Then the header will display a "Restore" button
      const messageView = getMessageView();
      expect(await messageView.actionButton("Restore")).toBeInTheDocument();
    });
  });
});
