import type QueueThroughputSummary from "@/resources/QueueThroughputSummary";

export enum EndpointClassification {
  Full = 0,
  SendOnly = 1,
}

export interface Queue {
  nameHash: string;
  scope: string;
  details: QueueThroughputSummary;
}

export interface Endpoint {
  clientId: string;
  name: string;
  queues: Queue[];
  classification: EndpointClassification;
  endpointSize: string;
}
