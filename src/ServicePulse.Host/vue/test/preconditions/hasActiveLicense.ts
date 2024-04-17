
import licenseTemplate from "../mocks/license-template";
import { SetupFactoryOptions } from "../driver";
import { platform } from "os";
import { license } from "@/composables/serviceLicense";

export const hasActiveLicense = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  const response = {...licenseTemplate};
  driver.mockEndpoint(`${serviceControlInstanceUrl}license`, {    
    body: response,
  });
  return response;
};

export const hasPlatformExpiredLicense = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  const response = {...licenseTemplate, license_status: "InvalidDueToExpiredSubscription"};
  driver.mockEndpoint(`${serviceControlInstanceUrl}license`, {    
    body: response,
  });
  return response;
};