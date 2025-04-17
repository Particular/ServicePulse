import type EndpointDetails from "@/resources/EndpointDetails";

export default interface FailedMessage {
  id: string;
  message_type: string;
  time_sent?: string;
  is_system_message: boolean;
  exception: ExceptionDetails;
  message_id: string;
  number_of_processing_attempts: number;
  status: FailedMessageStatus;
  sending_endpoint: EndpointDetails;
  receiving_endpoint: EndpointDetails;
  queue_address: string;
  time_of_failure: string;
  last_modified: string;
  edited: boolean;
  edit_of: string;
}

export interface FailedMessageError {
  notFound: boolean;
  error: boolean;
}

export interface ExceptionDetails {
  exception_type: string;
  message: string;
  source: string;
  stack_trace: string;
}

export enum FailedMessageStatus {
  Unresolved = "unresolved",
  Resolved = "resolved",
  RetryIssued = "retryIssued",
  Archived = "archived",
}
