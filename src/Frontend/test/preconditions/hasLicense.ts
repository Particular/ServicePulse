import { activeLicenseResponse } from "../mocks/license-response-template";
import { SetupFactoryOptions } from "../driver";
import LicenseInfo, { LicenseStatus } from "@/resources/LicenseInfo";
import { stat } from "fs";

export const hasActiveLicense = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}license`, {
    body: activeLicenseResponse,
  });
  return activeLicenseResponse;
};

export enum Expiring {
  Trial,
  UpgradeProtection,
  Subscription,
}

export enum Expired {  
  Subscription,
  Trial,
  UpgradeProtection
}

export const hasLicenseWith = (licenseStatus:Expired | Expiring) => ({ driver }: SetupFactoryOptions) =>  {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  let status: LicenseStatus = LicenseStatus.Valid;

  switch(licenseStatus){
    //EXPIRED
    case Expired.Subscription:
      status = LicenseStatus.InvalidDueToExpiredSubscription;
      break;
    case Expired.Trial:
      status = LicenseStatus.InvalidDueToExpiredTrial;
      break;
    case Expired.UpgradeProtection:
      status = LicenseStatus.InvalidDueToExpiredUpgradeProtection;
      break;
    
    //EXPIRING
    case Expiring.Subscription:
      status = LicenseStatus.ValidWithExpiringSubscription;
      break;
    case Expiring.Trial:
      status = LicenseStatus.ValidWithExpiringTrial;
      break;
    case Expiring.UpgradeProtection:
      status = LicenseStatus.ValidWithExpiringUpgradeProtection;
      break;
  }

  driver.mockEndpoint(`${serviceControlInstanceUrl}license`, {body:<LicenseInfo>{
    registered_to: "ACME Software",
    edition: "Enterprise",
    expiration_date: "",
    upgrade_protection_expiration: "2050-01-01T00:00:00.0000000Z",
    license_type: "Commercial",
    instance_name: "Particular.ServiceControl",
    trial_license: (status == LicenseStatus.ValidWithExpiringTrial || status == LicenseStatus.InvalidDueToExpiredTrial),    
    license_status: status    
  }});
}
