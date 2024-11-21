import { EndpointStatus } from "@/resources/Heartbeat";

export interface EndpointsView {
  id: string;
  name: string;
  host_display_name: string;
  monitor_heartbeat: boolean;
  heartbeat_information?: {
    last_report_at: string;
    reported_status: EndpointStatus;
  };
  supports_heartbeats: boolean;
  is_sending_heartbeats: boolean;
}
