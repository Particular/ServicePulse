import { EndpointDetails } from "@/resources/MonitoringEndpoint";
import { monitoredEndpointDetails, instanceForEndpoint } from "../mocks/monitored-endpoint-template";
import { SetupFactoryOptions } from "../driver";
import { messageTypeForEndpoint } from "../mocks/monitored-endpoint-template";

export const hasMonitoredEndpointDetails =
  (endpointDetails: EndpointDetails) =>
  ({ driver }: SetupFactoryOptions) => {
    const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
    driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints/${endpointDetails.instances[0].name}`, {
      body: endpointDetails,
    });
    return endpointDetails;
  };

export const hasEndpointMessageTypesNamed =
  (messageNames: string[]) =>
  ({ driver }: SetupFactoryOptions) => {
    const endpointDetails = structuredClone(monitoredEndpointDetails);
    endpointDetails.messageTypes = [];
    endpointDetails.messageTypes.push(...messageNames.map((name) => ({ ...messageTypeForEndpoint, typeName: name })));

    const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
    driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints/${endpointDetails.instances[0].name}`, {
      body: endpointDetails,
    });

    return endpointDetails;
  };

export const hasEndpointInstancesNamed =
  (instanceNames: string[]) =>
  ({ driver }: SetupFactoryOptions) => {
    const endpointDetails = structuredClone(monitoredEndpointDetails);
    endpointDetails.instances = [];
    endpointDetails.instances.push(...instanceNames.map((name) => ({ ...instanceForEndpoint, name: name })));

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
