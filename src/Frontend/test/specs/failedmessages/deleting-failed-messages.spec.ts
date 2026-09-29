import { expect } from "vitest";
import { waitFor } from "@testing-library/vue";
import { test, describe } from "../../drivers/vitest/driver";
import type { Driver } from "../../driver";
import * as precondition from "../../preconditions";
import type { DeletableFailedMessageTestBed } from "../../preconditions/deletableFailedMessage";
import { hasMessageStatusLabel, isDeleteConfirmationVisible, isDeleteMessageButtonVisible, isRestoreMessageButtonVisible, messageTypeTitle } from "./questions/messageDetails";
import { clickDeleteMessage, confirmDeleteMessage } from "./actions/deleteMessage";

const GROUP_ID = "81dca64e-76fc-e1c3-11a2-3069f51c58c8";
const MESSAGE_ID = "40134401-bab9-41aa-9acb-b19c0066f22d";
const MESSAGE_TYPE = "ServiceControl.SmokeTest.SimpleCommand";

async function givenAFailedMessageIsDisplayed(driver: Driver): Promise<DeletableFailedMessageTestBed> {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  const bed = await driver.setUp(precondition.hasDeletableFailedMessage({ withGroupId: GROUP_ID, withMessageId: MESSAGE_ID, withContentType: "application/json", withBody: { Index: 0, Data: "" } }));

  await driver.goTo(`messages/${GROUP_ID}`);
  await waitFor(() => expect(messageTypeTitle()).toBe(MESSAGE_TYPE));

  return bed;
}

describe("FEATURE: Deleting failed messages", () => {
  describe("RULE: All failed messages should be able to be deleted", () => {
    test("EXAMPLE: A delete message button should be shown when viewing the message details", async ({ driver }) => {
      await givenAFailedMessageIsDisplayed(driver);

      expect(isDeleteMessageButtonVisible()).toBe(true);
    });

    test("EXAMPLE: Clicking the delete message button asks the user to confirm", async ({ driver }) => {
      await givenAFailedMessageIsDisplayed(driver);

      await clickDeleteMessage();

      expect(isDeleteConfirmationVisible()).toBe(true);
    });

    test("EXAMPLE: Confirming the deletion deletes the message and the view shows it as deleted", async ({ driver }) => {
      const bed = await givenAFailedMessageIsDisplayed(driver);
      await clickDeleteMessage();

      await confirmDeleteMessage();

      await waitFor(() => expect(bed.deletedIds).toEqual([GROUP_ID]));

      await waitFor(
        () => {
          expect(isDeleteMessageButtonVisible()).toBe(false);
          expect(isRestoreMessageButtonVisible()).toBe(true);
          expect(hasMessageStatusLabel(/^Deleted$/)).toBe(true);
        },
        { timeout: 5000 }
      );
    });
  });
});
