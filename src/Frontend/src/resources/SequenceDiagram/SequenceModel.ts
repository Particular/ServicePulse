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
    //TODO: order messages
    // NOTE: All sending endpoints are created first to ensure version info is retained
    for (const message of messages) {
      endpointRegistry.register(this.createSendingEndpoint(message));
    }
    for (const message of messages) {
      endpointRegistry.register(this.createProcessingEndpoint(message));
    }

    for (const message of messages) {
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
      message.receiving_endpoint.name === message.sending_endpoint.name && message.receiving_endpoint.host === message.sending_endpoint.host ? message.headers.find((h) => h.key === NServiceBusHeaders.Version)?.value : undefined
    );
  }

  private createSendingEndpoint(message: Message): EndpointItem {
    return new EndpointItem(message.sending_endpoint.name, message.sending_endpoint.host, message.sending_endpoint.host_id, message.headers.find((h) => h.key === NServiceBusHeaders.Version)?.value);
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
      //TODO version stuff
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
    if (version) this.#versions.add(version);
  }

  get host() {
    return this.#host;
  }
  get hostId() {
    return this.#hostId;
  }

  get equatableKey() {
    return `${this.#hostId}###${this.#host}`;
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
