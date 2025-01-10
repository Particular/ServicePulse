import { EndpointStatus } from "@/resources/Heartbeat";
import { SetupFactoryOptions } from "../driver";
import { EndpointsView } from "@/resources/EndpointView";

export const hasHeartbeatsEndpoints =
  (endpoints: EndpointsView[]) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.service_control_url}endpoints`, {
      body: endpoints,
    });
    return endpoints;
  };

export const hasUnhealthyHeartbeatsEndpoints = (numberOfUnhealthyEndpoints: number = 1) => {
  const unhealthyEndpoints = [];

  for (let i = 0; i < numberOfUnhealthyEndpoints; i++) {
    unhealthyEndpoints.push(<EndpointsView>{
      is_sending_heartbeats: true,
      id: "",
      name: `UnhealthyHeartbeatEndpoint_${i}`,
      monitor_heartbeat: true,
      host_display_name: "",
      heartbeat_information: { reported_status: EndpointStatus.Dead, last_report_at: "" },
    });
  }

  return hasHeartbeatsEndpoints(unhealthyEndpoints);
};

export const hasNoHeartbeatsEndpoints = hasHeartbeatsEndpoints([]);
