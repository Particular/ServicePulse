import { screen } from "@testing-library/vue";

const RESTORE_CONFIRMATION_NAME = /restore the selected messages/i;

function normalise(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function tabElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(".tabs h5"));
}

function tabLabel(tab: HTMLElement): string {
  return normalise(tab.querySelector("a")?.textContent ?? "");
}

export function isTabActive(tabName: string): boolean {
  return tabElements().some((tab) => tabLabel(tab) === tabName && tab.classList.contains("active"));
}

export function browserTabTitle(): string {
  return document.title;
}

export function selectedDeletedPeriod(): string {
  return normalise(document.querySelector(".msg-group-menu .sp-btn-menu")?.textContent ?? "");
}

export function groupHeading(): string | null {
  const heading = document.querySelector<HTMLElement>("h1.group-title");
  return heading ? normalise(heading.textContent ?? "") : null;
}

export function groupMessageCount(): string | null {
  const count = document.querySelector<HTMLElement>("h3.group-message-count");
  return count ? normalise(count.textContent ?? "") : null;
}

export function noMessagesMessage(): string | null {
  const message = screen.queryByText(/there are currently no messages/i);
  return message && message.getAttribute("role") === "status" ? normalise(message.textContent ?? "") : null;
}

export function isEmptyMessageVisible(): boolean {
  return noMessagesMessage() !== null;
}

export function selectionButtonText(): string | null {
  const button = document.querySelector<HTMLElement>(".btn-toolbar button.select-all");
  return button ? normalise(button.textContent ?? "") : null;
}

export function getRestoreButton(): HTMLElement {
  return screen.getByRole("button", { name: /restore \d+ selected/i }) as HTMLElement;
}

export function isRestoreButtonDisabled(): boolean {
  return (getRestoreButton() as HTMLButtonElement).disabled;
}

export function restoreButtonText(): string {
  return normalise(getRestoreButton().textContent ?? "");
}

export function isRestoreConfirmationVisible(): boolean {
  return screen.queryByRole("dialog", { name: RESTORE_CONFIRMATION_NAME }) !== null;
}

export function getRestoreConfirmation(): HTMLElement {
  return screen.getByRole("dialog", { name: RESTORE_CONFIRMATION_NAME }) as HTMLElement;
}
