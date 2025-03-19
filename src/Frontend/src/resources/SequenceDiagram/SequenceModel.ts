import { NServiceBusHeaders } from "../Header";
import Message from "../Message";

export interface ConversationModel {
  endpoints: Endpoint[];
}

interface Endpoint {
  name: string;
  hosts: EndpointHost[];
  hostId: string;
}

interface EndpointHost {
  host: string;
  hostId: string;
}

export class ModelCreator implements ConversationModel {
  #endpoints: EndpointItem[];

  constructor(messages: Message[]) {
    this.#endpoints = [];

    const endpointRegistry = new EndpointRegistry();
    const messagesInOrder = MessageTreeNode.createTree(messages).flatMap((node) => node.walk());

    // NOTE: All sending endpoints are created first to ensure version info is retained
    for (const message of messagesInOrder) {
      endpointRegistry.register(this.createSendingEndpoint(message));
    }
    for (const message of messagesInOrder) {
      endpointRegistry.register(this.createProcessingEndpoint(message));
    }

    for (const message of messagesInOrder) {
      const sendingEndpoint = endpointRegistry.get(this.createSendingEndpoint(message));
      if (!this.#endpoints.find((endpoint) => endpoint.name === sendingEndpoint?.name)) {
        this.#endpoints.push(sendingEndpoint);
      }
      const processingEndpoint = endpointRegistry.get(this.createProcessingEndpoint(message));
      if (!this.#endpoints.find((endpoint) => endpoint.name === processingEndpoint?.name)) {
        this.#endpoints.push(processingEndpoint);
      }
    }
  }

  private createProcessingEndpoint(message: Message): EndpointItem {
    return new EndpointItem(
      message.receiving_endpoint.name,
      message.receiving_endpoint.host,
      message.receiving_endpoint.host_id,
      message.receiving_endpoint.name === message.sending_endpoint.name && message.receiving_endpoint.host === message.sending_endpoint.host ? message.headers.find((h) => h.key === NServiceBusHeaders.NServiceBusVersion)?.value : undefined
    );
  }

  private createSendingEndpoint(message: Message): EndpointItem {
    return new EndpointItem(message.sending_endpoint.name, message.sending_endpoint.host, message.sending_endpoint.host_id, message.headers.find((h) => h.key === NServiceBusHeaders.NServiceBusVersion)?.value);
  }

  get endpoints(): Endpoint[] {
    return [...this.#endpoints];
  }
}

class EndpointItem implements Endpoint {
  #hosts: Map<string, Host>;
  #name: string;

  constructor(name: string, host: string, id: string, version?: string) {
    const initialHost = new Host(host, id, version);
    this.#hosts = new Map<string, Host>([[initialHost.equatableKey, initialHost]]);
    this.#name = name;
  }

  get name() {
    return this.#name;
  }
  get hosts() {
    return [...this.#hosts].map(([, host]) => host);
  }
  get host() {
    return [...this.#hosts].map(([, host]) => host.host).join(",");
  }
  get hostId() {
    return [...this.#hosts].map(([, host]) => host.hostId).join(",");
  }

  addHost(host: Host) {
    if (!this.#hosts.has(host.equatableKey)) {
      this.#hosts.set(host.equatableKey, host);
    } else {
      const existing = this.#hosts.get(host.equatableKey)!;
      existing.addVersions(host.versions);
    }
  }
}

class Host implements EndpointHost {
  #host: string;
  #hostId: string;
  #versions: Set<string>;

  constructor(host: string, hostId: string, version?: string) {
    this.#host = host;
    this.#hostId = hostId;
    this.#versions = new Set<string>();
    this.addVersions([version]);
  }

  get host() {
    return this.#host;
  }
  get hostId() {
    return this.#hostId;
  }

  get versions() {
    return [...this.#versions];
  }

  get equatableKey() {
    return `${this.#hostId}###${this.#host}`;
  }

  addVersions(versions: (string | undefined)[]) {
    versions.filter((version) => version).forEach((version) => this.#versions.add(version!.toLowerCase()));
  }
}

class EndpointRegistry {
  #store = new Map<string, EndpointItem>();

  register(item: EndpointItem) {
    let endpoint = this.#store.get(item.name);
    if (!endpoint) {
      endpoint = item;
      this.#store.set(endpoint.name, endpoint);
    }

    item.hosts.forEach((host) => endpoint.addHost(host));
  }

  get(item: EndpointItem) {
    return this.#store.get(item.name)!;
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
    //TODO: check performance of this. We may need to pre-calculate the processed_at as a date on the message object
    return [this.#message, ...this.children.sort((a, b) => new Date(a.message.processed_at).getTime() - new Date(b.message.processed_at).getTime()).flatMap((child) => child.walk())];
  }
}
