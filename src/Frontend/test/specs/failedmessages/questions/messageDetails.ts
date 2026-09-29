import { screen } from "@testing-library/vue";
import { normalise } from "./domText";

const DELETE_CONFIRMATION_NAME = /delete this message/i;

export function messageTypeTitle(): string | null {
  const title = document.querySelector<HTMLElement>("h1.message-type-title");
  return title ? normalise(title.textContent ?? "") : null;
}

export function isDeleteMessageButtonVisible(): boolean {
  return screen.queryByRole("button", { name: /^delete message$/i }) !== null;
}

export function isRestoreMessageButtonVisible(): boolean {
  return screen.queryByRole("button", { name: /^restore$/i }) !== null;
}

export function isEditAndRetryButtonVisible(): boolean {
  return screen.queryByRole("button", { name: /^edit & retry$/i }) !== null;
}

export function messageStatusLabels(): string[] {
  return Array.from(document.querySelectorAll<HTMLElement>(".metadata-label")).map((label) => normalise(label.textContent ?? ""));
}

export function hasMessageStatusLabel(label: RegExp): boolean {
  return messageStatusLabels().some((candidate) => label.test(candidate));
}

export function isDeleteConfirmationVisible(): boolean {
  return screen.queryByRole("dialog", { name: DELETE_CONFIRMATION_NAME }) !== null;
}

export function getDeleteConfirmation(): HTMLElement {
  return screen.getByRole("dialog", { name: DELETE_CONFIRMATION_NAME }) as HTMLElement;
}
