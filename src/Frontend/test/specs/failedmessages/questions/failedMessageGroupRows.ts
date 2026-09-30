import { labelledValue, normalise } from "./domText";

const ROW_SELECTOR = ".row.box.box-group.failed-message-group";

export interface FailedMessageGroupRow {
  title: string;
  messageCount: string;
  firstFailed: string;
  lastFailed: string;
  /** "n/a" for a group that has never been retried. */
  lastRetried: string;
  /** The note text without the "NOTE:" prefix, or null when the group has no note. */
  note: string | null;
  actions: string[];
  isHovered: boolean;
  isSelectable: boolean;
  element: HTMLElement;
}

function messageCountValue(spans: string[]): string {
  return spans.find((span) => /^\d+ messages?$/.test(span)) ?? "";
}

function noteValue(row: HTMLElement): string | null {
  const note = row.querySelector<HTMLElement>(".note");
  return note ? normalise((note.textContent ?? "").replace(/^\s*NOTE:/, "")) : null;
}

function queryRows(): FailedMessageGroupRow[] {
  return Array.from(document.querySelectorAll<HTMLElement>(ROW_SELECTOR)).map((element) => {
    const titleElement = element.querySelector<HTMLElement>("p.lead");
    const spans = Array.from(element.querySelectorAll<HTMLElement>("p.metadata > span.metadata")).map((span) => normalise(span.textContent ?? ""));

    return {
      title: normalise(titleElement?.textContent ?? ""),
      messageCount: messageCountValue(spans),
      firstFailed: labelledValue(spans, "First failed:"),
      lastFailed: labelledValue(spans, "Last failed:"),
      lastRetried: labelledValue(spans, "Last retried:"),
      note: noteValue(element),
      actions: Array.from(element.querySelectorAll<HTMLButtonElement>("button")).map((button) => normalise(button.textContent ?? "")),
      isHovered: element.matches(":hover"),
      // The row is a div, so Vue renders :disabled as the string "true"/"false" rather than toggling the attribute
      isSelectable: element.getAttribute("disabled") !== "true",
      element,
    };
  });
}

export function getFailedMessageGroupRows(): FailedMessageGroupRow[] {
  return queryRows();
}

export function getFailedMessageGroupRowCount(): number {
  return queryRows().length;
}

export function getFailedMessageGroupRow(title: string): FailedMessageGroupRow | undefined {
  return queryRows().find((row) => row.title === title);
}
