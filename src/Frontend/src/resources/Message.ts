import type EndpointDetails from "@/resources/EndpointDetails";
import Header from "./Header";

export default interface Message {
  id: string;
  message_id: string;
  message_type: string;
  sending_endpoint: EndpointDetails;
  receiving_endpoint: EndpointDetails;
  time_sent: string;
  processed_at: string;
  critical_time: string;
  processing_time: string;
  delivery_time: string;
  is_system_message: boolean;
  conversation_id: string;
  headers: Header[];
  status: MessageStatus;
  message_intent: MessageIntent;
  body_url: string;
  body_size: number;
  instance_id: string;
  invoked_sagas?: SagaInfo[];
  originates_from_saga?: SagaInfo;
}

export enum MessageStatus {
  Failed = "failed",
  RepeatedFailure = "repeatedFailure",
  Successful = "successful",
  ResolvedSuccessfully = "resolvedSuccessfully",
  ArchivedFailure = "archivedFailure",
  RetryIssued = "retryIssued",
}

export enum MessageIntent {
  Send = "send",
  Publish = "publish",
  Subscribe = "subscribe",
  Unsubscribe = "unsubscribe",
  Reply = "reply",
  Init = "init",
}

export interface SagaInfo {
  change_status?: string;
  saga_type: string;
  saga_id: string;
}
