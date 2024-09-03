export interface LogicalEndpoint {
  name: string;
  monitor_heartbeat: boolean;
  heartbeat_information?: {
    last_report_at: string;
    reported_status: EndpointStatus;
  };
  track_instances: boolean;
  alive_count: number;
  down_count: number;
}

export interface EndpointSettings {
  name: string;
  track_instances: boolean;
}

export enum EndpointStatus {
  Alive = "beating",
  Dead = "dead",
}
