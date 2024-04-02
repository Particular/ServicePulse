export interface Endpoint {
  id: string;
  name: string;
  host_display_name: string;
  monitored: boolean;
  monitor_heartbeat: boolean;
  heartbeat_information: {
    last_reported_at: string;
    reported_status: EndpointStatus;
  };
  is_sending_heartbeats: boolean;
}

export enum EndpointStatus {
  Alive = "beating",
  Dead = "dead",
}
