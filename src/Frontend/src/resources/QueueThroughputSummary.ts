//Note that this is called EndpointThroughputSummary in ServiceControl, but
// due to endpoints being used on LicensedEndpointView, it makes the data clearer
// to name it QueueThroughputSummary (which is what it actually is)
interface QueueThroughputSummary {
  name: string;
  name_hash: string;
  is_known_endpoint: boolean;
  user_indicator: string;
  max_daily_throughput: number;
  monthly_throughput?: MonthlyThroughput[];
  average_monthly_throughput?: number;
}

export interface MonthlyThroughput {
  month: string;
  throughput: number;
}

export type { QueueThroughputSummary as default };
