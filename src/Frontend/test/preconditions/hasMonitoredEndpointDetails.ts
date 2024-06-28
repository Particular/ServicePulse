import { EndpointDetails } from "@/resources/MonitoringEndpoint";
import { monitoredEndpointDetails, instanceForEndpoint, metricDigestForEndpoint } from "../mocks/monitored-endpoint-template";
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

export const hasEndpointWithMetricValues =
  (
    queueLengthLatest: number,
    queueLengthAverage: number,
    throughputLatest: number,
    throughputAverage: number,
    retriesLatest: number,
    retriesAverage: number,
    processingTimeLatest: number,
    processingTimeAverage: number,
    criticalTimeLatest: number,
    criticalTimeAverage: number
  ) =>
  ({ driver }: SetupFactoryOptions) => {
    const endpointDetails = structuredClone(monitoredEndpointDetails);
    if (endpointDetails.digest.metrics.queueLength === undefined) {
      return undefined;
    }
    if (endpointDetails.digest.metrics.throughput === undefined) {
      return undefined;
    }
    if (endpointDetails.digest.metrics.retries === undefined) {
      return undefined;
    }
    if (endpointDetails.digest.metrics.processingTime === undefined) {
      return undefined;
    }
    if (endpointDetails.digest.metrics.criticalTime === undefined) {
      return undefined;
    }

    endpointDetails.digest.metrics.queueLength.latest = queueLengthLatest;
    endpointDetails.digest.metrics.queueLength.average = queueLengthAverage;
    endpointDetails.digest.metrics.throughput.latest = throughputLatest;
    endpointDetails.digest.metrics.throughput.average = throughputAverage;
    endpointDetails.digest.metrics.retries.latest = retriesLatest;
    endpointDetails.digest.metrics.retries.average = retriesAverage;
    endpointDetails.digest.metrics.processingTime.latest = processingTimeLatest;
    endpointDetails.digest.metrics.processingTime.average = processingTimeAverage;
    endpointDetails.digest.metrics.criticalTime.latest = criticalTimeLatest;
    endpointDetails.digest.metrics.criticalTime.average = criticalTimeAverage;

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
