import { SetupFactoryOptions } from "../driver";
import LicenseInfo, { LicenseStatus, LicenseType } from "@/resources/LicenseInfo";
import { useLicense } from "@/composables/serviceLicense";

const { license } = useLicense();
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
    let triallicense = false;
    let upgradeprotectionexpiration = "";
    let expirationdate = "";

    switch (licenseType) {
      case LicenseType.Subscription:
        status = isExpired ? LicenseStatus.InvalidDueToExpiredSubscription : LicenseStatus.ValidWithExpiringSubscription;
        expirationdate = customISOString;
        break;
      case LicenseType.Trial:
        status = isExpired ? LicenseStatus.InvalidDueToExpiredTrial : LicenseStatus.ValidWithExpiringTrial;
        expirationdate = customISOString;
        triallicense = true;
        break;
      case LicenseType.UpgradeProtection:
        status = isExpired ? LicenseStatus.InvalidDueToExpiredUpgradeProtection : LicenseStatus.ValidWithExpiringUpgradeProtection;
        upgradeprotectionexpiration = customISOString;
        break;
    }

    //We need to reset the global state to ensure the warning toast is always triggered by the value changing between multiple test runs. See documented issue and proposed solution https://github.com/Particular/ServicePulse/issues/1905
    license.license_status = LicenseStatus.Unavailable;

    const response = { ...licenseResponseTemplate, license_type: licenseType, trial_license: triallicense, expiration_date: expirationdate, upgrade_protection_expiration: upgradeprotectionexpiration, license_status: status };
    console.log(response);
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
