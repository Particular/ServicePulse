export interface Endpoint {
  name: string;
  errorCount: number;
  serviceControlId: string;
  isScMonitoringDisconnected: boolean;
  metrics: EndpointMetrics;
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

export interface EndpointInstance {
  name: string;
  id: string;
  isStale: boolean;
  metrics: EndpointMetrics;
}

export interface EndpointDetails {
  instances: EndpointInstance[];
  metricDetails: {
    metrics: EndpointMetrics;
  };
}

export interface GroupedEndpoint {
  groupName: string;
  shortName: string;
  endpoint: Endpoint;
}

export interface EndpointGroup {
  group: string;
  endpoints: GroupedEndpoint[];
}
