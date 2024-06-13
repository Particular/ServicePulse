import { EndpointDetails } from "@/resources/MonitoringEndpoint";
import { SetupFactoryOptions } from "../driver";

export const hasMonitoredEndpointDetails =
  (endpointDetails: EndpointDetails) =>
  ({ driver }: SetupFactoryOptions) => {
    const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
    driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints/${endpointDetails.instances[0].name}?history=1`, {
      body: endpointDetails,
    });
    return endpointDetails;
  };
