import { screen } from "@testing-library/vue";
import { normalise } from "./domText";

const ROW_SELECTOR = ".row.box.repeat-item.failed-message";
const RETRY_ALL_CONFIRMATION_NAME = /confirm retry of all messages/i;
const SELECT_QUEUE_FIRST_NAME = /select a queue first/i;

export function getPendingRetryRowCount(): number {
  return document.querySelectorAll(ROW_SELECTOR).length;
}

export function selectedRetryPeriod(): string {
  return normalise(document.querySelector(".msg-group-menu .sp-btn-menu")?.textContent ?? "");
}

export function getRetryAllConfirmation(): HTMLElement {
  return screen.getByRole("dialog", { name: RETRY_ALL_CONFIRMATION_NAME }) as HTMLElement;
}

export function isRetryAllConfirmationVisible(): boolean {
  return screen.queryByRole("dialog", { name: RETRY_ALL_CONFIRMATION_NAME }) !== null;
}

export function isSelectQueueFirstNoticeVisible(): boolean {
  return screen.queryByRole("dialog", { name: SELECT_QUEUE_FIRST_NAME }) !== null;
}
