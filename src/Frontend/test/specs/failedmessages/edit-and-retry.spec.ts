import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import type { EditAndRetryConfigTestBed } from "../../preconditions/recoverability";
import type { Driver } from "../../driver";
import { openEditAndRetryEditor } from "./actions/openEditAndRetryEditor";
import { getEditAndRetryEditor } from "./questions/getEditAndRetryEditor";
import { isEditAndRetryButtonVisible, messageTypeTitle } from "./questions/messageDetails";
import { expect } from "vitest";
import { waitFor } from "@testing-library/vue";

const GROUP_ID = "81dca64e-76fc-e1c3-11a2-3069f51c58c8";
const MESSAGE_ID = "40134401-bab9-41aa-9acb-b19c0066f22d";
const MESSAGE_TYPE = "ServiceControl.SmokeTest.SimpleCommand";

async function givenAFailedMessageIsDisplayed(driver: Driver, allowEditing: boolean): Promise<EditAndRetryConfigTestBed> {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  const editConfig = await driver.setUp(precondition.hasEditAndRetryConfig(allowEditing));
  await driver.setUp(
    precondition.hasFailedMessage({
      withGroupId: GROUP_ID,
      withMessageId: MESSAGE_ID,
      withContentType: "application/json",
      withBody: { Index: 0, Data: "" },
    })
  );

  await driver.goTo(`messages/${GROUP_ID}`);
  await waitFor(() => expect(messageTypeTitle()).toBe(MESSAGE_TYPE));

  await waitFor(() => expect(editConfig.wasServed()).toBe(true));

  return editConfig;
}

describe("FEATURE: Editing failed messages", () => {
  describe("RULE: Editing of a message should only be allowed when ServiceControl 'AllowMessageEditing' is enabled", () => {
    test("EXAMPLE: ServiceControl 'AllowMessageEditing' is disabled", async ({ driver }) => {
      await givenAFailedMessageIsDisplayed(driver, false);

      expect(isEditAndRetryButtonVisible()).toBe(false);
    });

    test("EXAMPLE: ServiceControl 'AllowMessageEditing' is enabled", async ({ driver }) => {
      await givenAFailedMessageIsDisplayed(driver, true);

      await waitFor(() => expect(isEditAndRetryButtonVisible()).toBe(true));
    });
  });

  describe("RULE: Only messages with with a content-type that is editable text should be allowed to be edited", () => {
    [{ contentType: "application/atom+xml" }, { contentType: "application/ld+json" }, { contentType: "application/vnd.masstransit+json" }].forEach(({ contentType }) => {
      test(`EXAMPLE: Editing a message with "${contentType}" content-type`, async ({ driver }) => {
        // Given a failed message is displayed in the Failed Messages list
        // And the message has a content-type of "${contentType}"
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.enableEditAndRetry);

        await driver.setUp(
          precondition.hasFailedMessage({
            withGroupId: "81dca64e-76fc-e1c3-11a2-3069f51c58c8",
            withMessageId: "40134401-bab9-41aa-9acb-b19c0066f22d",
            withContentType: contentType,
            withBody: { Index: 0, Data: "" },
          })
        );

        //When the user opens the message editor
        await driver.goTo("messages/81dca64e-76fc-e1c3-11a2-3069f51c58c8");
        await openEditAndRetryEditor();
        const messageEditor = await getEditAndRetryEditor();
        await messageEditor.switchToMessageBodyTab();

        //Then The message body should be editable
        expect(messageEditor.bodyFieldIsReadOnly()).toBeFalsy();
      });
    });

    test(`EXAMPLE: Editing a message with a content-type not recognized as editable text`, async ({ driver }) => {
      // Given a failed message is displayed in the Failed Messages list
      // And the message has a content-type of application/octet-stream
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.enableEditAndRetry);

      await driver.setUp(
        precondition.hasFailedMessage({
          withGroupId: "81dca64e-76fc-e1c3-11a2-3069f51c58c8",
          withMessageId: "40134401-bab9-41aa-9acb-b19c0066f22d",
          withContentType: "application/octet-stream",
          withBody: { Index: 0, Data: "" },
        })
      );

      //When the user opens the message editor
      await driver.goTo("messages/81dca64e-76fc-e1c3-11a2-3069f51c58c8");
      await openEditAndRetryEditor();
      const messageEditor = await getEditAndRetryEditor();
      await messageEditor.switchToMessageBodyTab();

      //Then The message body should NOT be editable
      expect(messageEditor.bodyFieldIsReadOnly()).toBeTruthy();
      expect(
        messageEditor.hasWarningMatchingText(/message body cannot be edited because content type "application\/octet-stream" is not supported\. only messages with content types "application\/json" and "text\/xml" can be edited\./i)
      ).toBeTruthy();
    });
  });
});
