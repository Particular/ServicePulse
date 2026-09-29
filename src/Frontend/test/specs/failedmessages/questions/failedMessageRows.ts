import { isBold, labelledValue, normalise } from "./domText";

const ROW_SELECTOR = ".row.box.repeat-item.failed-message";

export interface FailedMessageRow {
  id: string;
  messageType: string;
  messageTypeIsBold: boolean;
  endpoint: string;
  machine: string;
  failedSince: string;
  retryFailures: string | null;
  retryFailuresAreEmphasised: boolean;
  exceptionMessage: string;
  isSelected: boolean;
  isSelectable: boolean;
  hasRequestRetryButton: boolean;
  element: HTMLElement;
}

function queryRows(): FailedMessageRow[] {
  return Array.from(document.querySelectorAll<HTMLElement>(ROW_SELECTOR)).map((element) => {
    const checkbox = element.querySelector<HTMLInputElement>("input.checkbox");
    const messageTypeElement = element.querySelector<HTMLElement>("p.lead.break");
    const spans = Array.from(element.querySelectorAll<HTMLElement>("p.metadata > span.metadata")).map((span) => normalise(span.textContent ?? ""));
    const retryBadge = Array.from(element.querySelectorAll<HTMLElement>("p.metadata > span")).find((span) => /retry failures/i.test(span.textContent ?? ""));

    return {
      id: checkbox?.id.replace(/^checkbox/, "") ?? "",
      messageType: normalise(messageTypeElement?.textContent ?? ""),
      messageTypeIsBold: isBold(messageTypeElement),
      endpoint: labelledValue(spans, "Endpoint:"),
      machine: labelledValue(spans, "Machine:"),
      failedSince: labelledValue(spans, "Failed:"),
      retryFailures: retryBadge ? normalise(retryBadge.textContent ?? "") : null,
      retryFailuresAreEmphasised: retryBadge?.classList.contains("label-important") ?? false,
      exceptionMessage: normalise(element.querySelector("pre.stacktrace-preview")?.textContent ?? ""),
      isSelected: checkbox?.checked ?? false,
      isSelectable: checkbox !== null && !checkbox.disabled,
      hasRequestRetryButton: element.querySelector('button[name="retryMessage"]') !== null,
      element,
    };
  });
}

export function getFailedMessageRows(): FailedMessageRow[] {
  return queryRows();
}

export function getFailedMessageRowCount(): number {
  return queryRows().length;
}

export function getFailedMessageRow(messageId: string): FailedMessageRow | undefined {
  return queryRows().find((row) => row.id === messageId);
}

export function isFailedMessageListed(messageId: string): boolean {
  return getFailedMessageRow(messageId) !== undefined;
}

export function getSelectedFailedMessageCount(): number {
  return queryRows().filter((row) => row.isSelected).length;
}

export function listedMessageIds(): string[] {
  return queryRows().map((row) => row.id);
}

export function isRetryInProgress(messageId: string): boolean {
  const row = getFailedMessageRow(messageId);
  return row ? /retry in progress/i.test(row.element.textContent ?? "") : false;
}
