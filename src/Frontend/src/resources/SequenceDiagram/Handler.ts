import { NServiceBusHeaders } from "../Header";
import Message, { MessageStatus } from "../Message";
import { MessageProcessingRoute, RoutedMessage } from "./RoutedMessage";
import { Endpoint } from "./Endpoint";
import { friendlyTypeName } from "./SequenceModel";

export interface Handler {
  readonly id: string;
  name?: string;
  readonly endpoint: Endpoint;
  readonly isPartOfSaga: boolean;
  partOfSaga?: string;
  state: HandlerState;
  inMessage?: RoutedMessage;
  readonly outMessages: RoutedMessage[];
  processedAt?: Date;
  readonly handledAt?: Date;
  processingTime?: number;
  route?: MessageProcessingRoute;
  readonly selectedMessage?: Message;
  updateProcessedAt(timeSent: Date): void;
  addOutMessage(routedMessage: RoutedMessage): void;
}

export enum HandlerState {
  Fail,
  Success,
}

export const ConversationStartHandlerName = "First";

export function createSendingHandler(message: Message, sendingEndpoint: Endpoint): Handler {
  return new HandlerItem(message.headers.find((h) => h.key === NServiceBusHeaders.RelatedTo)?.value ?? ConversationStartHandlerName, sendingEndpoint);
}

export function createProcessingHandler(message: Message, processingEndpoint: Endpoint): Handler {
  const handler = new HandlerItem(message.message_id, processingEndpoint);
  updateProcessingHandler(handler, message);
  return handler;
}

export class HandlerRegistry {
  #store = new Map<[string, string], HandlerItem>();

  register(handler: Handler) {
    const existing = this.#store.get([handler.id, handler.endpoint.name]);
    if (existing) return { handler: existing, isNew: false };

    this.#store.set([handler.id, handler.endpoint.name], handler as HandlerItem);
    return { handler, isNew: true };
  }
}

export function updateProcessingHandler(handler: Handler, message: Message) {
  handler.processedAt = new Date(message.processed_at);
  //assuming if we have days in the timespan then something is very, very wrong
  //TODO: extract logic since it's also currently used in AuditList
  const [hh, mm, ss] = message.processing_time.split(":");
  handler.processingTime = ((parseInt(hh) * 60 + parseInt(mm)) * 60 + parseFloat(ss)) * 1000;
  handler.name = friendlyTypeName(message.message_type);

  if ((message.invoked_sagas?.length ?? 0) > 0) {
    handler.partOfSaga = message.invoked_sagas!.map((saga) => friendlyTypeName(saga.saga_type)).join(", ");
  }

  switch (message.status) {
    case MessageStatus.ArchivedFailure:
    case MessageStatus.Failed:
    case MessageStatus.RepeatedFailure:
      handler.state = HandlerState.Fail;
      break;
    default:
      handler.state = HandlerState.Success;
  }
}

class HandlerItem implements Handler {
  #id: string;
  #endpoint: Endpoint;
  #processedAtGuess?: Date;
  #outMessages: RoutedMessage[];
  name?: string;
  partOfSaga?: string;
  inMessage?: RoutedMessage;
  state: HandlerState = HandlerState.Fail;
  processedAt?: Date;
  processingTime?: number;
  route?: MessageProcessingRoute;

  constructor(id: string, endpoint: Endpoint) {
    this.#id = id;
    this.#endpoint = endpoint;
    this.#outMessages = [];
  }

  get id() {
    return this.#id;
  }

  get endpoint() {
    return this.#endpoint;
  }

  get isPartOfSaga() {
    return this.partOfSaga != null;
  }

  get handledAt() {
    return this.processedAt ?? this.#processedAtGuess;
  }

  get selectedMessage() {
    return this.route?.fromRoutedMessage?.selectedMessage;
  }

  get outMessages() {
    return [...this.#outMessages];
  }

  updateProcessedAt(timeSent: Date) {
    if (!this.#processedAtGuess || this.#processedAtGuess.getTime() > timeSent.getTime()) this.#processedAtGuess = timeSent;
  }

  addOutMessage(routedMessage: RoutedMessage) {
    this.#outMessages = [routedMessage, ...this.#outMessages].sort((a, b) => (a.sentTime?.getTime() ?? 0) - (b.sentTime?.getTime() ?? 0));
  }
}
