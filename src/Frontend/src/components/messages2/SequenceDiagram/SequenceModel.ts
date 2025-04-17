import { NServiceBusHeaders } from "../../../resources/Header";
import Message from "../../../resources/Message";
import { createRoutedMessage, createRoute, MessageProcessingRoute } from "./RoutedMessage";
import { createProcessingEndpoint, createSendingEndpoint, Endpoint, EndpointRegistry } from "./Endpoint";
import { ConversationStartHandlerName, createProcessingHandler, createSendingHandler, Handler, HandlerRegistry, updateProcessingHandler } from "./Handler";

export interface ConversationModel {
  endpoints: Endpoint[];
}

export class ModelCreator implements ConversationModel {
  #endpoints: Endpoint[];
  #handlers: Handler[];
  #processingRoutes: MessageProcessingRoute[];

  constructor(messages: Message[]) {
    this.#endpoints = [];
    this.#processingRoutes = [];

    const endpointRegistry = new EndpointRegistry();
    const handlerRegistry = new HandlerRegistry();
    const firstOrderHandlers: Handler[] = [];
    const messagesInOrder = MessageTreeNode.createTree(messages).flatMap((node) => node.walk());

    // NOTE: All sending endpoints are created first to ensure version info is retained
    for (const message of messagesInOrder) {
      endpointRegistry.register(createSendingEndpoint(message));
    }
    for (const message of messagesInOrder) {
      endpointRegistry.register(createProcessingEndpoint(message));
    }

    for (const message of messagesInOrder) {
      const sendingEndpoint = endpointRegistry.get(createSendingEndpoint(message));
      if (!this.#endpoints.find((endpoint) => endpoint.name === sendingEndpoint?.name)) {
        this.#endpoints.push(sendingEndpoint);
      }
      const processingEndpoint = endpointRegistry.get(createProcessingEndpoint(message));
      if (!this.#endpoints.find((endpoint) => endpoint.name === processingEndpoint?.name)) {
        this.#endpoints.push(processingEndpoint);
      }

      const { handler: sendingHandler, isNew: sendingHandlerIsNew } = handlerRegistry.register(createSendingHandler(message, sendingEndpoint));
      if (sendingHandlerIsNew) {
        firstOrderHandlers.push(sendingHandler);
        sendingEndpoint.addHandler(sendingHandler);
      }
      sendingHandler.updateProcessedAt(new Date(message.time_sent));

      const { handler: processingHandler, isNew: processingHandlerIsNew } = handlerRegistry.register(createProcessingHandler(message, processingEndpoint));
      if (processingHandlerIsNew) {
        firstOrderHandlers.push(processingHandler);
        processingEndpoint.addHandler(processingHandler);
      } else {
        updateProcessingHandler(processingHandler, message);
      }

      const routedMessage = createRoutedMessage(message);
      routedMessage.toHandler = processingHandler;
      routedMessage.fromHandler = sendingHandler;
      this.#processingRoutes.push(createRoute(routedMessage, processingHandler));
      processingHandler.inMessage = routedMessage;
      sendingHandler.addOutMessage(routedMessage);
    }

    const start = firstOrderHandlers.filter((h) => h.id === ConversationStartHandlerName);
    const orderByHandledAt = firstOrderHandlers.filter((h) => h.id !== ConversationStartHandlerName).sort((a, b) => (a.handledAt?.getTime() ?? 0) - (b.handledAt?.getTime() ?? 0));

    this.#handlers = [...start, ...orderByHandledAt];
  }

  get endpoints(): Endpoint[] {
    return [...this.#endpoints];
  }

  get handlers(): Handler[] {
    return [...this.#handlers];
  }

  get routes(): MessageProcessingRoute[] {
    return [...this.#processingRoutes];
  }
}

class MessageTreeNode {
  #message: Message;
  #parent?: string;
  #children: MessageTreeNode[];

  static createTree(messages: Message[]) {
    const nodes = messages.map((message) => new MessageTreeNode(message));
    const resolved: MessageTreeNode[] = [];
    const index = new Map<string, MessageTreeNode>(nodes.map((node) => [node.id, node]));

    for (const node of nodes) {
      const parent = index.get(node.parent ?? "");
      if (parent) {
        parent.addChild(node);
        resolved.push(node);
      }
    }

    return nodes.filter((node) => !resolved.includes(node));
  }

  constructor(message: Message) {
    this.#message = message;
    this.#parent = message.headers.find((h) => h.key === NServiceBusHeaders.RelatedTo)?.value;
    this.#children = [];
  }

  get id() {
    return this.#message.message_id;
  }
  get parent() {
    return this.#parent;
  }
  get message() {
    return this.#message;
  }
  get children() {
    return [...this.#children];
  }

  addChild(childNode: MessageTreeNode) {
    this.#children.push(childNode);
  }

  walk(): Message[] {
    return [this.#message, ...this.children.sort((a, b) => new Date(a.message.processed_at).getTime() - new Date(b.message.processed_at).getTime()).flatMap((child) => child.walk())];
  }
}
