export interface Endpoint {
  name: string;
  errorCount: number;
  serviceControlId: string;
  isScMonitoringDisconnected: boolean;
  metrics: EndpointMetrics;
  isStale: boolean;
  endpointInstanceIds: string[];
  disconnectedCount: number;
  connectedCount: number;
}

export interface EndpointValues {
  points: number[];
  average: number;
}

export interface EndpointValuesWithTime extends EndpointValues {
  timeAxisValues: Date[];
}

export interface EndpointMetrics {
  [index: string]: EndpointValues;
  queueLength: EndpointValues;
  throughput: EndpointValues;
  retries: EndpointValues;
  processingTime: EndpointValuesWithTime;
  criticalTime: EndpointValuesWithTime;
}

const defaultMetricData: EndpointValues = {
  points: [],
  average: 0,
};
const defaultTimeMetricData: EndpointValuesWithTime = {
  ...defaultMetricData,
  timeAxisValues: [],
};
export const emptyEndpointMetrics = (): EndpointMetrics => ({
  queueLength: defaultMetricData,
  throughput: defaultMetricData,
  retries: defaultMetricData,
  processingTime: defaultTimeMetricData,
  criticalTime: defaultTimeMetricData,
});

export interface EndpointInstance {
  name: string;
  id: string;
  isStale: boolean;
  metrics: EndpointMetrics;
}

export interface ExtendedEndpointInstance extends EndpointInstance {
  isScMonitoringDisconnected: boolean;
  serviceControlId: string;
  errorCount: number;
  isStale: boolean;
}

export interface MessageType {
  id: string;
  typeName: string;
  assemblyName: string;
  assemblyVersion: string;
  culture: string;
  publicKeyToken: string;
  metrics: EndpointMetrics;
}

export interface MessageTypeDetails {
  typeName: string;
  assemblyName: string;
  assemblyVersion: string;
  culture?: string;
  publicKeyToken?: string;
}

export interface ExtendedMessageType extends MessageType {
  shortName: string;
  messageTypeHierarchy?: MessageTypeDetails[];
  containsTypeHierarchy?: boolean;
  tooltipText: string;
}

export interface EndpointDetails {
  instances: EndpointInstance[];
  metricDetails: {
    metrics: EndpointMetrics;
  };
  messageTypes: MessageType[];
}

export interface ExtendedEndpointDetails extends EndpointDetails {
  instances: ExtendedEndpointInstance[];
  isScMonitoringDisconnected: boolean;
  serviceControlId: string;
  errorCount: number;
  isStale: boolean;
}

export const emptyEndpointDetails = (): ExtendedEndpointDetails => ({
  instances: [],
  metricDetails: { metrics: emptyEndpointMetrics() },
  isScMonitoringDisconnected: false,
  serviceControlId: "",
  errorCount: 0,
  isStale: false,
  messageTypes: [],
});

export interface GroupedEndpoint {
  groupName: string;
  shortName: string;
  endpoint: Endpoint;
}

export interface EndpointGroup {
  group: string;
  endpoints: GroupedEndpoint[];
}

export interface EndpointDetailsError {
  error: any;
}

export function isError(obj: EndpointDetails | EndpointDetailsError): obj is EndpointDetailsError {
  return (obj as EndpointDetailsError).error !== undefined;
}
