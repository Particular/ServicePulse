import type QueueThroughputSummary from "@/resources/QueueThroughputSummary";

export interface LicensedEndpointDetails {
  endpoints: ApiEndpoint[];
  infrastructure_queues: ApiQueue[];
  excluded_queues: ApiQueue[];
  service_end_date: string;
  products: ApiProduct[];
  valid_id: boolean;
}

export interface ApiEndpoint {
  name: string;
  classification: EndpointClassification;
  endpoint_size: string;
  queues: ApiQueue[];
}

export interface ApiQueue {
  name_hash: string;
  scope: string;
}

interface ApiProduct {
  product_code: string;
  monthly_throughput: number | null;
}

export enum EndpointClassification {
  Full = 0,
  SendOnly = 1,
}

export interface Queue {
  nameHash: string;
  scope: string;
  details: QueueThroughputSummary;
}

export class Endpoint {
  readonly clientId: string;
  name: string;
  readonly queues: Queue[];
  readonly classification: EndpointClassification;
  readonly endpointSize: EndpointSize;
  readonly availableSizes: EndpointSize[];

  constructor(clientId: string, name: string, queues: Queue[], classification: EndpointClassification, endpointSize: EndpointSize, availableSizes: EndpointSize[]) {
    this.clientId = clientId;
    this.name = name;
    this.queues = queues;
    this.classification = classification;
    this.endpointSize = endpointSize;
    this.availableSizes = availableSizes;
  }

  get totalMonthlyThroughput() {
    return this.queues.map((queue) => queue.details?.average_monthly_throughput ?? 0).reduce((total, value) => total + value, 0);
  }

  get currentSize() {
    return this.availableSizes.find((size) => size.throughputMin <= this.totalMonthlyThroughput && (size.throughputMax ?? Number.MAX_VALUE) > this.totalMonthlyThroughput)!;
  }

  get isInBreach() {
    return this.endpointSize !== this.currentSize;
  }
}

export class EndpointSize {
  readonly name: string;
  readonly throughputMin: number;
  readonly throughputMax: number | null;

  constructor(name: string, throughputMin: number, throughputMax: number | null) {
    this.name = name;
    this.throughputMin = throughputMin;
    this.throughputMax = throughputMax;
  }

  get throughputText() {
    switch (this.throughputMax) {
      case null:
        return "Unlimited";
      default:
        return `between ${this.throughputMin.toLocaleString()} and ${this.throughputMax.toLocaleString()} messages per month`;
    }
  }
}
