import { screen, within } from "@testing-library/vue";
import { normalise } from "./domText";

function tabElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(".tabs h5"));
}

function tabLabel(tab: HTMLElement): string {
  const link = tab.querySelector("a");
  if (!link) {
    return "";
  }
  const label = Array.from(link.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join(" ");
  return normalise(label);
}

export function isTabActive(tabName: string): boolean {
  return tabElements().some((tab) => tabLabel(tab) === tabName && tab.classList.contains("active"));
}

export function browserTabTitle(): string {
  return document.title;
}

export function allFailedMessagesTabBadge(): string | null {
  const tab = tabElements().find((candidate) => tabLabel(candidate) === "All Failed Messages");
  const badge = tab?.querySelector<HTMLElement>("span.badge");
  return badge ? normalise(badge.textContent ?? "") : null;
}

export function failedMessagesNavBadge(): string | null {
  const navItem = Array.from(document.querySelectorAll<HTMLElement>("a")).find((anchor) => normalise(anchor.querySelector(".navbar-label")?.textContent ?? "") === "Failed Messages");
  const badge = navItem?.querySelector<HTMLElement>("span.badge");
  return badge ? normalise(badge.textContent ?? "") : null;
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

function toolbar(): HTMLElement {
  const element = document.querySelector<HTMLElement>(".btn-toolbar");
  if (!element) {
    throw new Error("The failed messages toolbar is not displayed");
  }
  return element;
}

function toolbarButton(name: RegExp): HTMLButtonElement {
  return within(toolbar()).getByRole("button", { name }) as HTMLButtonElement;
}

export function selectionButtonText(): string | null {
  const button = within(toolbar()).queryByRole("button", { name: /^(select all|clear selection)$/i });
  return button ? normalise(button.textContent ?? "") : null;
}

export function isSelectionButtonDisabled(): boolean {
  return toolbarButton(/^(select all|clear selection)$/i).disabled;
}

export function retrySelectedText(): string {
  return normalise(toolbarButton(/retry \d+ selected/i).textContent ?? "");
}

export function isRetrySelectedDisabled(): boolean {
  return toolbarButton(/retry \d+ selected/i).disabled;
}

export function deleteSelectedText(): string {
  return normalise(toolbarButton(/delete \d+ selected/i).textContent ?? "");
}

export function isDeleteSelectedDisabled(): boolean {
  return toolbarButton(/delete \d+ selected/i).disabled;
}

export function exportSelectedText(): string {
  return normalise(toolbarButton(/export \d+ selected/i).textContent ?? "");
}

export function isExportSelectedDisabled(): boolean {
  return toolbarButton(/export \d+ selected/i).disabled;
}
