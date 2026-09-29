import { isBold, labelledValue, normalise } from "./domText";

const ROW_SELECTOR = ".row.box.box-group.deleted-message-group";

export interface DeletedMessageGroupRow {
  title: string;
  titleIsBold: boolean;
  messageCount: string;
  firstFailed: string;
  lastFailed: string;
  /** "n/a" for a group that has never been retried or restored. */
  lastRetried: string;
  restoreGroupText: string | null;
  restoreGroupIsDisabled: boolean;
  element: HTMLElement;
}

function restoreGroupButton(row: HTMLElement): HTMLButtonElement | null {
  return Array.from(row.querySelectorAll<HTMLButtonElement>("button")).find((button) => /restore group/i.test(button.textContent ?? "")) ?? null;
}

function messageCountValue(spans: string[]): string {
  return spans.find((span) => /^\d+ messages?$/.test(span)) ?? "";
}

function queryRows(): DeletedMessageGroupRow[] {
  return Array.from(document.querySelectorAll<HTMLElement>(ROW_SELECTOR)).map((element) => {
    const titleElement = element.querySelector<HTMLElement>("p.lead.break");
    const spans = Array.from(element.querySelectorAll<HTMLElement>("p.metadata > span.metadata")).map((span) => normalise(span.textContent ?? ""));
    const restoreButton = restoreGroupButton(element);

    return {
      title: normalise(titleElement?.textContent ?? ""),
      titleIsBold: isBold(titleElement),
      messageCount: messageCountValue(spans),
      firstFailed: labelledValue(spans, "First failed:"),
      lastFailed: labelledValue(spans, "Last failed:"),
      lastRetried: labelledValue(spans, "Last retried:"),
      restoreGroupText: restoreButton ? normalise(restoreButton.textContent ?? "") : null,
      restoreGroupIsDisabled: restoreButton?.disabled ?? true,
      element,
    };
  });
}

export function getDeletedMessageGroupRows(): DeletedMessageGroupRow[] {
  return queryRows();
}

export function getDeletedMessageGroupRowCount(): number {
  return queryRows().length;
}

export function getDeletedMessageGroupRow(title: string): DeletedMessageGroupRow | undefined {
  return queryRows().find((row) => row.title === title);
}
