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
  status: string;
  message_intent: string;
  body_url: string;
  body_size: number;
  instance_id: string;
}
export interface MessageWithExtendedUIProperties extends Message {
  notFound: boolean;
  error: boolean
  headersNotFound: boolean;
  messageBodyNotFound: boolean;
}