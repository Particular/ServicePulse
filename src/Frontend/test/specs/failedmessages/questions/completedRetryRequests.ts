import { screen } from "@testing-library/vue";
import { labelledValue, normalise } from "./domText";

const LIST_SELECTOR = ".lasttenoperations";

export interface CompletedRetryRequestRow {
  title: string;
  messagesSent: string;
  started: string;
  completed: string;
  isVisible: boolean;
}

function isDisplayed(element: HTMLElement | null): boolean {
  for (let current = element; current; current = current.parentElement) {
    if (getComputedStyle(current).display === "none") {
      return false;
    }
  }
  return element !== null;
}

export function completedRetryRequestsHeading(): HTMLElement {
  return screen.getByText(/last 10 completed retry requests/i);
}

export function getCompletedRetryRequestRows(): CompletedRetryRequestRow[] {
  // .box-no-click is the NoData message box, not a retry request
  return Array.from(document.querySelectorAll<HTMLElement>(`${LIST_SELECTOR} .row.box:not(.box-no-click)`)).map((element) => {
    const spans = Array.from(element.querySelectorAll<HTMLElement>("p.metadata > span.metadata")).map((span) => normalise(span.textContent ?? ""));

    return {
      title: normalise(element.querySelector("p.lead")?.textContent ?? ""),
      messagesSent: labelledValue(spans, "Messages sent:"),
      started: labelledValue(spans, "Retry request started:"),
      completed: labelledValue(spans, "Retry request completed:"),
      isVisible: isDisplayed(element),
    };
  });
}

export function isCompletedRetryRequestsListExpanded(): boolean {
  const list = document.querySelector<HTMLElement>(`${LIST_SELECTOR} .no-mobile-side-padding`);
  return isDisplayed(list);
}

export function isNoCompletedRetryRequestsMessageVisible(): boolean {
  const message = screen.queryByText(/no group retry requests have ever been completed/i);
  return message !== null && message.getAttribute("role") === "status" && isDisplayed(message);
}

export function visibleCompletedRetryRequestsSummary(): string | null {
  const summary = Array.from(document.querySelectorAll<HTMLElement>(`${LIST_SELECTOR} .short-group-history`)).find((element) => isDisplayed(element));
  return summary ? normalise(summary.textContent ?? "") : null;
}
