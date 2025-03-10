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
  message_intent: string;
  body_url: string;
  body_size: number;
  instance_id: string;
}
export interface ExtendedMessage extends Message {
  notFound: boolean;
  error: boolean;
  headersNotFound: boolean;
  messageBodyNotFound: boolean;
}

export enum MessageStatus {
  Failed = "failed",
  RepeatedFailure = "repeatedFailure",
  Successful = "successful",
  ResolvedSuccessfully = "resolvedSuccessfully",
  ArchivedFailure = "archivedFailure",
  RetryIssued = "retryIssued",
}

// export class AuditMessage implements Message {
//   id: string;
//   message_id: string;
//   message_type: string;
//   sending_endpoint: EndpointDetails;
//   receiving_endpoint: EndpointDetails;
//   time_sent: string;
//   processed_at: string;
//   critical_time: string;
//   processing_time: string;
//   delivery_time: string;
//   is_system_message: boolean;
//   conversation_id: string;
//   headers: Header[];
//   status: string;
//   message_intent: string;
//   body_url: string;
//   body_size: number;
//   instance_id: string;

//   constructor(message: Message) {
//     this.id = message.id;
//     this.message_id = message.message_id;
//     this.message_type = message.message_type;
//     this.sending_endpoint = message.sending_endpoint;
//     this.receiving_endpoint = message.receiving_endpoint;
//     this.time_sent = message.time_sent;
//     this.processed_at = message.processed_at;
//     this.critical_time = message.critical_time;
//     this.processing_time = message.processing_time;
//     this.delivery_time = message.delivery_time;
//     this.is_system_message = message.is_system_message;
//     this.conversation_id = message.conversation_id;
//     this.headers = message.headers;
//     this.status = message.status;
//     this.message_intent = message.message_intent;
//     this.body_url = message.body_url;
//     this.body_size = message.body_size;
//     this.instance_id = message.instance_id;
//   }

//   get message_status(): MessageStatus {
//     return this.status as MessageStatus;
//   }
// }
