import { monitoredInstanceTemplate } from "../mocks/service-control-instance-template";
import { SetupFactoryOptions } from "../driver";

export const hasServiceControlMonitoringInstance = ({ driver }: SetupFactoryOptions) => {
  const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
  driver.mockEndpoint(monitoringInstanceUrl, {
    body: monitoredInstanceTemplate,
    headers: { "X-Particular-Version": "5.0.4" },
  });
  return monitoredInstanceTemplate;
};
