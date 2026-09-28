const ROW_SELECTOR = ".row.box.repeat-item.failed-message";

export interface DeletedMessageRow {
  id: string;
  messageType: string;
  messageTypeIsBold: boolean;
  endpoint: string;
  machine: string;
  failedSince: string;
  deletedSince: string;
  scheduledForDeletion: string;
  deletionIsUrgent: boolean;
  retryFailures: string | null;
  retryFailuresAreEmphasised: boolean;
  exceptionMessage: string;
  isSelected: boolean;
  element: HTMLElement;
}

function normalise(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function labelledValue(spans: string[], label: string): string {
  const span = spans.find((candidate) => candidate.startsWith(label));
  return span ? normalise(span.slice(label.length)) : "";
}

function queryRows(): DeletedMessageRow[] {
  return Array.from(document.querySelectorAll<HTMLElement>(ROW_SELECTOR)).map((element) => {
    const checkbox = element.querySelector<HTMLInputElement>("input.checkbox");
    const spans = Array.from(element.querySelectorAll<HTMLElement>("p.metadata > span.metadata")).map((span) => normalise(span.textContent ?? ""));
    const retryBadge = Array.from(element.querySelectorAll<HTMLElement>("p.metadata > span")).find((span) => /retry failures/i.test(span.textContent ?? ""));

    return {
      id: checkbox?.id.replace(/^checkbox/, "") ?? "",
      messageType: normalise(element.querySelector("p.lead.break")?.textContent ?? ""),
      messageTypeIsBold: element.querySelector("p.lead.break") !== null,
      endpoint: labelledValue(spans, "Endpoint:"),
      machine: labelledValue(spans, "Machine:"),
      failedSince: labelledValue(spans, "Failed:"),
      deletedSince: labelledValue(spans, "Deleted:"),
      scheduledForDeletion: labelledValue(spans, "Scheduled for deletion:"),
      deletionIsUrgent: element.querySelector("span.metadata.danger") !== null,
      retryFailures: retryBadge ? normalise(retryBadge.textContent ?? "") : null,
      retryFailuresAreEmphasised: retryBadge?.classList.contains("label-important") ?? false,
      exceptionMessage: normalise(element.querySelector("pre.stacktrace-preview")?.textContent ?? ""),
      isSelected: checkbox?.checked ?? false,
      element,
    };
  });
}

export function getDeletedMessageRows(): DeletedMessageRow[] {
  return queryRows();
}

export function getDeletedMessageRowCount(): number {
  return queryRows().length;
}

export function getDeletedMessageRow(messageId: string): DeletedMessageRow | undefined {
  return queryRows().find((row) => row.id === messageId);
}

export function isDeletedMessageListed(messageId: string): boolean {
  return getDeletedMessageRow(messageId) !== undefined;
}

export function getSelectedDeletedMessageCount(): number {
  return queryRows().filter((row) => row.isSelected).length;
}
