interface EndpointThroughputSummary {
  name: string;
  is_known_endpoint: boolean;
  user_indicator: string;
  max_daily_throughput: number;
  monthly_throughput?: MonthlyThroughput[];
  max_monthly_throughput?: number;
}

export interface MonthlyThroughput {
  month: string;
  throughput: number;
}

export type { EndpointThroughputSummary as default };
