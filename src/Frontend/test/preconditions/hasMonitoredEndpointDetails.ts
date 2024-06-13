import { EndpointDetails } from "@/resources/MonitoringEndpoint";
import { SetupFactoryOptions } from "../driver";

export const hasMonitoredEndpointDetails =
  (endpointDetails: EndpointDetails) =>
  ({ driver }: SetupFactoryOptions) => {
    const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
    driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints/${endpointDetails.instances[0].name}`, {
      body: endpointDetails,
    });
    return endpointDetails;
  };

export const hasMonitoredEndpointRecoverabilityByInstance =
  (id: string) =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
    driver.mockEndpoint(`${serviceControlInstanceUrl}recoverability/groups/Endpoint%20Instance`, {
      body: [],
    });
    return [];
  };

export const hasMonitoredEndpointRecoverabilityByName =
  (name: string) =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
    driver.mockEndpoint(`${serviceControlInstanceUrl}recoverability/groups/Endpoint%20Name?classifierFilter=${name}`, {
      body: [],
    });
    return [];
  };
