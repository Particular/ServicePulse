import { screen } from "@testing-library/vue";
import { normalise } from "./domText";

const RESTORE_GROUP_CONFIRMATION_NAME = /restore this group/i;

export function noGroupedMessagesMessage(): string | null {
  const message = screen.queryByText(/there are currently no grouped message failures/i);
  return message && message.getAttribute("role") === "status" ? normalise(message.textContent ?? "") : null;
}

export function isEmptyGroupsMessageVisible(): boolean {
  return noGroupedMessagesMessage() !== null;
}

export function isRestoreGroupConfirmationVisible(): boolean {
  return screen.queryByRole("dialog", { name: RESTORE_GROUP_CONFIRMATION_NAME }) !== null;
}

export function getRestoreGroupConfirmation(): HTMLElement {
  return screen.getByRole("dialog", { name: RESTORE_GROUP_CONFIRMATION_NAME }) as HTMLElement;
}

export function isRestoreInProgressVisible(): boolean {
  return screen.queryByText(/restore request in progress/i) !== null;
}

export function isRestoreCompletedVisible(): boolean {
  return screen.queryByText(/restore request completed/i) !== null;
}

export function isDismissButtonVisible(): boolean {
  return screen.queryByRole("button", { name: /^dismiss$/i }) !== null;
}
