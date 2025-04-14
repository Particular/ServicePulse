import FailedMessage, { FailedMessageError } from "@/resources/FailedMessage";
import Header from "@/resources/Header";
import { ConversationModel } from "./SequenceDiagram/SequenceModel";

export interface ExtendedFailedMessage extends FailedMessage {
  error_retention_period: number;
  delete_soon: boolean;
  deleted_in: string;
  retryInProgress: boolean;
  deleteInProgress: boolean;
  restoreInProgress: boolean;
  selected: boolean;
  retried: boolean;
  archiving: boolean;
  restoring: boolean;
  archived: boolean;
  resolved: boolean;
  headersNotFound: boolean;
  messageBodyNotFound: boolean;
  bodyUnavailable: boolean;
  headers: Header[];
  conversationId: string;
  conversation?: ConversationModel;
  messageBody: string;
  contentType: string;
  isEditAndRetryEnabled: boolean;
  redirect: boolean;
  submittedForRetrial: boolean;
}

export function isError(obj: ExtendedFailedMessage | FailedMessageError): obj is FailedMessageError {
  return (obj as FailedMessageError).error !== undefined || (obj as FailedMessageError).notFound !== undefined;
}
