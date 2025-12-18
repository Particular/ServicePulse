import { monitoredInstanceTemplate } from "../mocks/service-control-instance-template";
import { SetupFactoryOptions } from "../driver";
import { serviceControlVersionSupportingAllMessages } from "./auditCapability";

export const hasServiceControlMonitoringInstance = ({ driver }: SetupFactoryOptions) => {
  const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];
  driver.mockEndpoint(monitoringInstanceUrl, {
    body: monitoredInstanceTemplate,
    headers: { "X-Particular-Version": serviceControlVersionSupportingAllMessages },
  });
  return monitoredInstanceTemplate;
};
