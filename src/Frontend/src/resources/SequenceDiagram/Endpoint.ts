import { NServiceBusHeaders } from "../Header";
import Message from "../Message";
import { Handler } from "./Handler";

export interface Endpoint {
  readonly name: string;
  readonly hosts: EndpointHost[];
  readonly hostId: string;
  readonly handlers: Handler[];
  addHandler(handler: Handler): void;
}

export interface EndpointHost {
  readonly host: string;
  readonly hostId: string;
  readonly versions: string[];
}

export function createProcessingEndpoint(message: Message): Endpoint {
  return new EndpointItem(
    message.receiving_endpoint.name,
    message.receiving_endpoint.host,
    message.receiving_endpoint.host_id,
    message.receiving_endpoint.name === message.sending_endpoint.name && message.receiving_endpoint.host === message.sending_endpoint.host ? message.headers.find((h) => h.key === NServiceBusHeaders.NServiceBusVersion)?.value : undefined
  );
}

export function createSendingEndpoint(message: Message): Endpoint {
  return new EndpointItem(message.sending_endpoint.name, message.sending_endpoint.host, message.sending_endpoint.host_id, message.headers.find((h) => h.key === NServiceBusHeaders.NServiceBusVersion)?.value);
}

export class EndpointRegistry {
  #store = new Map<string, EndpointItem>();

  register(item: Endpoint) {
    let endpoint = this.#store.get(item.name);
    if (!endpoint) {
      endpoint = item as EndpointItem;
      this.#store.set(endpoint.name, endpoint);
    }

    item.hosts.forEach((host) => endpoint.addHost(host as Host));
  }

  get(item: Endpoint) {
    return this.#store.get(item.name)! as Endpoint;
  }
}

class EndpointItem implements Endpoint {
  #hosts: Map<string, Host>;
  #name: string;
  #handlers: Handler[] = [];

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
  get handlers() {
    return [...this.#handlers];
  }

  addHost(host: Host) {
    if (!this.#hosts.has(host.equatableKey)) {
      this.#hosts.set(host.equatableKey, host);
    } else {
      const existing = this.#hosts.get(host.equatableKey)!;
      existing.addVersions(host.versions);
    }
  }

  addHandler(handler: Handler) {
    this.#handlers.push(handler);
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
