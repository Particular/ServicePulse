import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/vue";
import { getRestoreButton, getRestoreConfirmation } from "../questions/deletedMessagesView";
import { selectDeletedMessage } from "./deletedMessageSelection";

export async function clickRestoreSelected(): Promise<void> {
  await userEvent.click(getRestoreButton());
}

export async function confirmRestoreSelected(): Promise<void> {
  await userEvent.click(within(getRestoreConfirmation()).getByRole("button", { name: "Yes" }));
}

export async function declineRestoreSelected(): Promise<void> {
  await userEvent.click(within(getRestoreConfirmation()).getByRole("button", { name: "No" }));
}

export async function restoreMessage(messageId: string): Promise<void> {
  await selectDeletedMessage(messageId);
  await clickRestoreSelected();
  await confirmRestoreSelected();
}
