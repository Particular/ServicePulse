import type { SetupFactoryOptions } from "../driver";
import { type default as Message, MessageIntent, MessageStatus } from "@/resources/Message";
import { NServiceBusHeaders } from "@/resources/Header";

const conversationId = "conv-1";

function createConversationMessage(id: string, messageType: string, intent: MessageIntent, from: string, to: string, secondsAfterStart: number, relatedTo?: string): Message {
  const timeSent = new Date(Date.now() - 5 * 60_000 + secondsAfterStart * 1000).toISOString();
  const fullType = `Shop.Messages.${messageType}, Shop.Messages`;
  const headers = [
    { key: NServiceBusHeaders.MessageId, value: id },
    { key: NServiceBusHeaders.NServiceBusVersion, value: "9.2.3" },
    { key: NServiceBusHeaders.TimeSent, value: timeSent },
    { key: NServiceBusHeaders.ProcessingEndpoint, value: to },
    { key: NServiceBusHeaders.EnclosedMessageTypes, value: fullType },
    { key: NServiceBusHeaders.ContentType, value: "application/json" },
    ...(relatedTo ? [{ key: NServiceBusHeaders.RelatedTo, value: relatedTo }] : []),
  ];

  return {
    id,
    message_id: id,
    message_type: fullType,
    sending_endpoint: { name: from, host_id: `host-${from}`, host: "localhost" },
    receiving_endpoint: { name: to, host_id: `host-${to}`, host: "localhost" },
    time_sent: timeSent,
    processed_at: new Date(Date.parse(timeSent) + 150).toISOString(),
    critical_time: "00:00:00.1500000",
    processing_time: "00:00:00.0500000",
    delivery_time: "00:00:00.1000000",
    is_system_message: false,
    conversation_id: conversationId,
    headers,
    status: MessageStatus.Successful,
    message_intent: intent,
    body_url: `/messages/${id}/body`,
    body_size: 64,
    instance_id: "instance-1",
  };
}

/** A conversation that starts with PlaceOrder and fans out to three endpoints. The first message keeps the id `msg-1`. */
export function createMessageConversation(): Message[] {
  return [
    createConversationMessage("msg-1", "PlaceOrder", MessageIntent.Send, "Shop.ClientUI", "Shop.Sales", 0),
    createConversationMessage("msg-2", "OrderPlaced", MessageIntent.Publish, "Shop.Sales", "Shop.Billing", 1, "msg-1"),
    createConversationMessage("msg-3", "OrderPlaced", MessageIntent.Publish, "Shop.Sales", "Shop.Shipping", 1, "msg-1"),
    createConversationMessage("msg-4", "OrderBilled", MessageIntent.Publish, "Shop.Billing", "Shop.Shipping", 2, "msg-2"),
  ];
}

/** Precondition: message details, the conversation behind the sequence and flow diagrams, and message bodies */
export const hasMessageConversation =
  (messages: Message[] = createMessageConversation()) =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlUrl = window.defaultConfig.service_control_url;
    driver.mockEndpointDynamic(`${serviceControlUrl}messages/search/:messageId`, "get", (_url, params) => Promise.resolve({ body: messages.filter((message) => message.message_id === decodeURIComponent(String(params.messageId))) }));
    driver.mockEndpointDynamic(`${serviceControlUrl}conversations/:conversationId`, "get", (_url, params) => Promise.resolve({ body: messages.filter((message) => message.conversation_id === params.conversationId) }));
    driver.mockEndpointDynamic(`${serviceControlUrl}messages/:id/body`, "get", (_url, params) => Promise.resolve({ body: { OrderId: `order-for-${params.id}`, Total: 42.5 } }));
  };
