export type SagaTimeoutStatus = "Pending" | "Triggered" | "Canceled" | "Unknown";
export type SagaTimeoutChangeKind = "Requested" | "Rescheduled" | "Canceled" | "Triggered" | "Rejected";
export type SagaTimeoutChangeSource = "Saga" | "Operator";
export type SagaTimeoutOperatorChange = "Reschedule" | "Cancel" | "Trigger";
export type SagaTimeoutListStatus = "pending" | "overdue" | "all";

export interface SagaTimeoutPendingOperation {
  operation_id: string;
  change: SagaTimeoutOperatorChange;
  requested_at: string;
  requested_due_time: string | null;
}

export interface SagaTimeoutView {
  timeout_id: string;
  endpoint_name: string;
  saga_type: string;
  saga_id: string;
  correlation_value: string | null;
  timeout_type: string;
  version: number;
  trigger_id: string;
  due_time: string;
  status: SagaTimeoutStatus;
  is_overdue: boolean;
  requested_at: string | null;
  last_change_kind: SagaTimeoutChangeKind;
  last_change_source: SagaTimeoutChangeSource;
  last_changed_at: string;
  host: string | null;
  management_address: string | null;
  pending_operation: SagaTimeoutPendingOperation | null;
}

export interface SagaTimeoutHistoryEntry {
  kind: SagaTimeoutChangeKind;
  version: number;
  trigger_id: string;
  due_time: string;
  changed_at: string;
  received_at: string;
  source: SagaTimeoutChangeSource;
  operation_id: string | null;
  requested_change: SagaTimeoutOperatorChange | null;
  requested_due_time: string | null;
  reason: string | null;
  host?: string | null;
}

export interface SagaTimeoutDetails extends SagaTimeoutView {
  payload_content_type: string | null;
  payload: string;
  history_truncated: boolean;
  history: SagaTimeoutHistoryEntry[];
}

export interface SagaTimeoutCounts {
  pending: number;
  overdue: number;
}

export interface SagaTimeoutOperationAccepted {
  operation_id: string;
}
