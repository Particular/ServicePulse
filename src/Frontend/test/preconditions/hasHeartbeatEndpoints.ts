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

export const hasUnhealthyHeartbeatsEndpoints = (numberOfUnhealthyEndpoints: number, endpointNamePrefix: string) => {
  const unhealthyEndpoints = [];

  for (let i = 0; i < numberOfUnhealthyEndpoints; i++) {
    unhealthyEndpoints.push(<EndpointsView>{
      is_sending_heartbeats: true,
      id: "",
      name: `${endpointNamePrefix}_${i}`,
      monitor_heartbeat: true,
      host_display_name: "",
      heartbeat_information: { reported_status: EndpointStatus.Dead, last_report_at: "" },
    });
  }

  return hasHeartbeatsEndpoints(unhealthyEndpoints);
};

export const hasAnUnhealthyEndpoint = () => hasUnhealthyHeartbeatsEndpoints(1, "UnhealthyHeartbeatEndpoint");

export const hasUnhealthyEndpoints = (numberOfUnhealthyHeartbeats: number) => hasUnhealthyHeartbeatsEndpoints(numberOfUnhealthyHeartbeats, "UnhealthyHeartbeatEndpoint");

export const hasAnUnhealthyEndpointWithNamePrefix = (endpointNamePrefix: string) => hasUnhealthyHeartbeatsEndpoints(1, endpointNamePrefix);

export const hasHealthyHeartbeatsEndpoints = (numberOfHealthyEndpoints: number, endpointNamePrefix: string) => {
  const healthyEndpoints = [];

  for (let i = 0; i < numberOfHealthyEndpoints; i++) {
    healthyEndpoints.push(<EndpointsView>{
      is_sending_heartbeats: true,
      id: "",
      name: `${endpointNamePrefix}_${i}`,
      monitor_heartbeat: true,
      host_display_name: "",
      heartbeat_information: { reported_status: EndpointStatus.Alive, last_report_at: "" },
    });
  }
  return hasHeartbeatsEndpoints(healthyEndpoints);
};

export const hasAHealthyEndpoint = () => hasHealthyHeartbeatsEndpoints(1, "HealthyHeartbeatEndpoit");

export const hasHealthyEndpoints = (numberOfUnhealthyHeartbeats: number) => hasHealthyHeartbeatsEndpoints(numberOfUnhealthyHeartbeats, "HealthyHeartbeatEndpoint");

export const hasAHealthyEndpointWithNamePrefix = (endpointNamePrefix: string) => hasHealthyHeartbeatsEndpoints(1, endpointNamePrefix);

export const hasNoHeartbeatsEndpoints = hasHeartbeatsEndpoints([]);

export const hasAnUnhealthyUnMonitoredEndpoint = () => {
  return hasHeartbeatsEndpoints([
    <EndpointsView>{
      is_sending_heartbeats: true,
      id: "",
      name: `Unhealthy_UnmonitoredEndpoint`,
      monitor_heartbeat: true,
      host_display_name: "",
      heartbeat_information: { reported_status: EndpointStatus.Dead, last_report_at: "" },
    },
  ]);
};
