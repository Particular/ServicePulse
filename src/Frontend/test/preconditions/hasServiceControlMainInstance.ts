import { serviceControlMainInstance } from "../mocks/service-control-instance-template";
import { SetupFactoryOptions } from "../driver";

export const hasServiceControlMainInstance = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(serviceControlInstanceUrl, {
    body: serviceControlMainInstance,
    headers: { "X-Particular-Version": "5.0.4" },
  });
  return serviceControlMainInstance;
};

export const hasServiceControlVersion = (version:string) => ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(window.defaultConfig.service_control_url, {
      body: structuredClone(serviceControlMainInstance),
      headers: { "X-Particular-Version": version },
  });  
}
