import { SetupFactoryOptions } from "../driver";
import LicenseInfo, { LicenseStatus, LicenseType } from "@/resources/LicenseInfo";

const licenseResponseTemplate = <LicenseInfo>{
  registered_to: "ACME Software",
  edition: "Enterprise",
  expiration_date: "2026-01-23T00:00:00.0000000Z",
  upgrade_protection_expiration: "",
  license_type: "Commercial",
  instance_name: "Particular.ServiceControl",
  trial_license: false,
  license_status: LicenseStatus.Valid,
  status: "valid",
};

export const withExpiredLicense = (licenseType: LicenseType, expiredDays: number) => getLicenseMockedResponse(licenseType, expiredDays, true);
export const withExpiringLicense = (licenseType: LicenseType, expiringInDays: number) => getLicenseMockedResponse(licenseType, expiringInDays, false);

const getLicenseMockedResponse =
  (licenseType: LicenseType, expiringInDays: number, isExpired: boolean) =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
    const customISOString = getCustomDateISOString(expiringInDays, isExpired);

    let status: LicenseStatus;
    switch (licenseType) {
      case LicenseType.Subscription:
        status = isExpired ? LicenseStatus.InvalidDueToExpiredSubscription : LicenseStatus.ValidWithExpiringSubscription;
        break;
      case LicenseType.Trial:
        status = isExpired ? LicenseStatus.InvalidDueToExpiredTrial : LicenseStatus.ValidWithExpiringTrial;
        break;
      case LicenseType.UpgradeProtection:
        status = isExpired ? LicenseStatus.InvalidDueToExpiredUpgradeProtection : LicenseStatus.ValidWithExpiringUpgradeProtection;
        break;
    }
    const response = { ...licenseResponseTemplate, license_type: licenseType, expiration_date: customISOString, license_status: status };
    driver.mockEndpoint(`${serviceControlInstanceUrl}license`, {
      body: response,
    });
    return response;
  };
function getCustomDateISOString(daysCount: number, isExpired: boolean) {
  const today = new Date();
  const customDate = new Date(today);

  if (isExpired) {
    customDate.setDate(today.getDate() - daysCount);
  } else {
    customDate.setDate(today.getDate() + daysCount);
  }

  const nativeISOString = customDate.toISOString(); // e.g., "2026-02-02T14:23:45.123Z"
  const customISOString = nativeISOString.replace(/\.\d+Z$/, (match) => match.slice(0, -1).padEnd(8, "0") + "Z");
  return customISOString;
}
