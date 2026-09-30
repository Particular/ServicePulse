import { screen } from "@testing-library/vue";
import { normalise } from "./domText";

export function noGroupedMessagesMessage(): string | null {
  const message = screen.queryByText(/there are currently no grouped message failures/i);
  return message && message.getAttribute("role") === "status" ? normalise(message.textContent ?? "") : null;
}

export function isEmptyGroupsMessageVisible(): boolean {
  return noGroupedMessagesMessage() !== null;
}

function menuSelection(label: string): string | null {
  const menu = screen.queryByText(label)?.closest<HTMLElement>(".msg-group-menu");
  const toggle = menu?.querySelector<HTMLButtonElement>("button.dropdown-toggle");
  return toggle ? normalise(toggle.textContent ?? "") : null;
}

export function selectedGrouping(): string | null {
  return menuSelection("Group by:");
}

export function selectedSort(): string | null {
  return menuSelection("Sort by:");
}

export function getConfirmationDialog(heading: RegExp): HTMLElement {
  return screen.getByRole("dialog", { name: heading }) as HTMLElement;
}

export function isConfirmationDialogVisible(heading: RegExp): boolean {
  return screen.queryByRole("dialog", { name: heading }) !== null;
}

export function isDeleteCompletedVisible(): boolean {
  return screen.queryByText(/delete request completed/i) !== null;
}

export function isDismissButtonVisible(): boolean {
  return screen.queryByRole("button", { name: /^dismiss$/i }) !== null;
}
