import { Endpoint } from "@/resources/Heartbeat";
import EndpointMonitoringStats from "@/resources/EndpointMonitoringStats";

export const heartbeatEndpointTemplate = <Endpoint>{
  id: "a557a124-96da-4b68-fadc-f9fe5d047fed",
  name: "Universe.Solarsystem.Earth-Endpoint5",
  host_display_name: "mobvm2",
  monitored: true,
  monitor_heartbeat: true,
  heartbeat_information: { last_report_at: "0001-01-01T00:00:00", reported_status: "dead" },
  is_sending_heartbeats: false,
  aliveCount: 0,
  downCount: 0,
};

export const heartbeatsFiveActiveOneFailing = <EndpointMonitoringStats>{
  active: 5,
  failing: 1,
};

export const heartbeatsFourActiveTwoFailing = <EndpointMonitoringStats>{
  active: 4,
  failing: 1,
};
