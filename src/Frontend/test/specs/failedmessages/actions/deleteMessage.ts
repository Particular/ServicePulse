import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/vue";
import { getDeleteConfirmation } from "../questions/messageDetails";

export async function clickDeleteMessage(): Promise<void> {
  await userEvent.click(screen.getByRole("button", { name: /^delete message$/i }));
}

export async function confirmDeleteMessage(): Promise<void> {
  await userEvent.click(within(getDeleteConfirmation()).getByRole("button", { name: "Yes" }));
}

export async function declineDeleteMessage(): Promise<void> {
  await userEvent.click(within(getDeleteConfirmation()).getByRole("button", { name: "No" }));
}

export async function deleteMessage(): Promise<void> {
  await clickDeleteMessage();
  await confirmDeleteMessage();
}
