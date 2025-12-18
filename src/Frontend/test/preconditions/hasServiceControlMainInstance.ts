import { serviceControlMainInstance } from "../mocks/service-control-instance-template";
import { SetupFactoryOptions } from "../driver";
import { serviceControlVersionSupportingAllMessages } from "./auditCapability";

export const hasServiceControlMainInstance =
  (serviceControlVersion = serviceControlVersionSupportingAllMessages) =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
    driver.mockEndpoint(serviceControlInstanceUrl, {
      body: serviceControlMainInstance,
      headers: { "X-Particular-Version": serviceControlVersion },
    });
    return serviceControlMainInstance;
  };
