import dayjs from "@/utils/dayjs";
import { typeToName } from "@/composables/typeHumanizer";
import type { SagaTimeoutChangeSource, SagaTimeoutHistoryEntry, SagaTimeoutView } from "@/resources/SagaTimeout";

export const OperatorRequestTimeoutMs = 10 * 60 * 1000;

export function shortTypeName(type: string | null | undefined) {
  return typeToName(type) ?? "";
}

export function fullTypeName(type: string | null | undefined) {
  return type?.split(",")[0].trim() ?? "";
}

export function formatUtc(date: string | null | undefined, withSeconds = false) {
  if (!date) return "n/a";
  return `${dayjs.utc(date).format(withSeconds ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD HH:mm")} UTC`;
}

export function sourceText(source: SagaTimeoutChangeSource) {
  return source === "Operator" ? "by operator" : "by saga";
}

export function historyEntryLabel(entry: SagaTimeoutHistoryEntry, previous: SagaTimeoutHistoryEntry | undefined) {
  if (entry.kind === "Rescheduled" && previous && dayjs.utc(previous.due_time).valueOf() === dayjs.utc(entry.due_time).valueOf()) {
    return "Payload updated";
  }
  return entry.kind;
}

export function isOperationUnanswered(timeout: SagaTimeoutView, now: number = Date.now()) {
  return timeout.pending_operation != null && now - dayjs.utc(timeout.pending_operation.requested_at).valueOf() > OperatorRequestTimeoutMs;
}

export function canForget(timeout: SagaTimeoutView, now: number = Date.now()) {
  return timeout.status === "Unknown" || isOperationUnanswered(timeout, now);
}

// Toast messages are rendered as HTML, and ServiceControl error details can echo request content.
export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
