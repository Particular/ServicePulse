import { reactive, computed, watch } from "vue";
import { useGetDayDiffFromToday } from "./formatter";
import { useFetchFromServiceControl } from "./serviceServiceControlUrls";
import { useShowToast } from "./toast.js";

const subscriptionExpiring = '<div><strong>Platform license expires soon</strong><div>Once the license expires you\'ll no longer be able to continue using the Particular Service Platform.</div><a href="#/configuration" class="btn btn-warning">View license details</a></div>';
const upgradeProtectionExpiring = '<div><strong>Upgrade protection expires soon</strong><div>Once upgrade protection expires, you\'ll no longer have access to support or new product versions</div><a href="#/configuration" class="btn btn-warning">View license details</a></div>';
const upgradeProtectionExpired = '<div><strong>Upgrade protection expired</strong><div>Once upgrade protection expires, you\'ll no longer have access to support or new product versions</div><a href="#/configuration" class="btn btn-warning">View license details</a></div>';
const trialExpiring = '<div ><strong>Non-production development license expiring</strong><div>Your non-production development license will expire soon. To continue using the Particular Service Platform you\'ll need to extend your license.</div><a href="http://particular.net/extend-your-trial?p=servicepulse" class="btn btn-warning"><i class="fa fa-external-link-alt"></i> Extend your license</a><a href="#/configuration" class="btn btn-light">View license details</a></div>';

export const license = reactive({
  edition: "",
  licenseEdition: "",
  expiration_date: undefined,
  formattedExpirationDate: "",
  upgrade_protection_expiration: undefined,
  formattedUpgradeProtectionExpiration: "",
  license_type: "",
  instance_name: "",
  formattedInstanceName: "",
  trial_license: true,
  license_status: "Unavailable",
});

export const licenseStatus = reactive({
  isSubscriptionLicense: false,
  isUpgradeProtectionLicense: false,
  isTrialLicense: false,
  isPlatformExpired: false,
  isPlatformTrialExpired: false,
  isPlatformTrialExpiring: false,
  isInvalidDueToUpgradeProtectionExpired: false,
  isValidWithExpiredUpgradeProtection: false,
  isValidWithExpiringUpgradeProtection: false,
  isExpired: false,
  upgradeDaysLeft: "",
  subscriptionDaysLeft: "",
  trialDaysLeft: "",
  warningLevel: "",
});

export function useLicense() {
  watch(
    () => license.license_status,
    async (newValue, oldValue) => {
      const checkForWarnings = oldValue !== null ? newValue && newValue != oldValue : newValue !== null;
      if (checkForWarnings) {
        displayWarningMessage(newValue);
      }
    }
  );

  return getLicense(license)
    .then((lic) => {
      Object.assign(license, lic);
      license.licenseEdition = computed(() => {
        return license.license_type && license.edition ? ", " + license.edition : "";
      });
      license.formattedInstanceName = computed(() => {
        return license.instance_name || "Upgrade ServiceControl to v3.4.0+ to see more information about this license";
      });
      license.formattedExpirationDate = computed(() => {
        return license.expiration_date ? new Date(license.expiration_date.replace("Z", "")).toLocaleDateString() : "";
      });
      license.formattedUpgradeProtectionExpiration = computed(() => {
        return license.upgrade_protection_expiration ? new Date(license.upgrade_protection_expiration.replace("Z", "")).toLocaleDateString() : "";
      });
      return license;
    })
    .then((lic) => {
      licenseStatus.isSubscriptionLicense = isSubscriptionLicense(lic);
      licenseStatus.isUpgradeProtectionLicense = isUpgradeProtectionLicense(lic);
      licenseStatus.isTrialLicense = lic.trial_license;
      licenseStatus.isPlatformExpired = lic.license_status === "InvalidDueToExpiredSubscription";
      licenseStatus.isPlatformTrialExpiring = lic.license_status === "ValidWithExpiringTrial";
      licenseStatus.isPlatformTrialExpired = lic.license_status === "InvalidDueToExpiredTrial";
      licenseStatus.isInvalidDueToUpgradeProtectionExpired = lic.license_status === "InvalidDueToExpiredUpgradeProtection";
      licenseStatus.isValidWithExpiredUpgradeProtection = lic.license_status === "ValidWithExpiredUpgradeProtection";
      licenseStatus.isValidWithExpiringUpgradeProtection = lic.license_status === "ValidWithExpiringUpgradeProtection";
      licenseStatus.upgradeDaysLeft = getUpgradeDaysLeft(lic);
      licenseStatus.subscriptionDaysLeft = getSubscriptionDaysLeft(lic);
      licenseStatus.trialDaysLeft = getTrialDaysLeft(lic);
      licenseStatus.warningLevel = getLicenseWarningLevel(lic.license_status);
      licenseStatus.isExpired = licenseStatus.isPlatformExpired || licenseStatus.isPlatformTrialExpired || licenseStatus.isInvalidDueToUpgradeProtectionExpired;
      return lic;
    });
}

function getLicenseWarningLevel(licenseStatus) {
  if (licenseStatus === "InvalidDueToExpiredTrial" || licenseStatus === "InvalidDueToExpiredSubscription" || licenseStatus === "InvalidDueToExpiredUpgradeProtection") return "danger";
  else if (licenseStatus === "ValidWithExpiringUpgradeProtection" || licenseStatus === "ValidWithExpiringTrial" || licenseStatus === "ValidWithExpiredUpgradeProtection" || licenseStatus === "ValidWithExpiringSubscription") return "warning";
  return "";
}

function isUpgradeProtectionLicense(license) {
  return license.upgrade_protection_expiration !== undefined && license.upgrade_protection_expiration !== "";
}

function isSubscriptionLicense(license) {
  return license.expiration_date !== undefined && license.expiration_date !== "" && !license.trial_license;
}

function displayWarningMessage(licenseStatus) {
  switch (licenseStatus) {
    case "ValidWithExpiredUpgradeProtection":
      useShowToast("warning", "", upgradeProtectionExpired, true);
      break;

    case "ValidWithExpiringTrial":
      useShowToast("warning", "", trialExpiring, true);
      break;

    case "ValidWithExpiringSubscription":
      useShowToast("warning", "", subscriptionExpiring, true);
      break;

    case "ValidWithExpiringUpgradeProtection":
      useShowToast("warning", "", upgradeProtectionExpiring, true);
      break;

    case "InvalidDueToExpiredTrial":
    case "InvalidDueToExpiredSubscription":
    case "InvalidDueToExpiredUpgradeProtection":
      useShowToast("error", "Error", 'Your license has expired. Please contact Particular Software support at: <a href="http://particular.net/support">http://particular.net/support</a>', true);
      break;
  }
}

function getSubscriptionDaysLeft(license) {
  if (license.license_status === "InvalidDueToExpiredSubscription") return " - expired";

  const isExpiring = license.license_status === "ValidWithExpiringSubscription";

  const expiringIn = useGetDayDiffFromToday(license.expiration_date);
  if (!isExpiring) return " - " + expiringIn + " days left";
  if (expiringIn === 0) return " - expiring today";
  if (expiringIn === 1) return " - expiring tomorrow";
  return " - expiring in " + expiringIn + " days";
}

function getTrialDaysLeft(license) {
  if (license.license_status === "InvalidDueToExpiredTrial") return " - expired";

  const isExpiring = license.license_status === "ValidWithExpiringTrial";

  const expiringIn = useGetDayDiffFromToday(license.expiration_date);
  if (!isExpiring) return " - " + expiringIn + " days left";
  if (expiringIn === 0) return " - expiring today";
  if (expiringIn === 1) return " - expiring tomorrow";
  return " - expiring in " + expiringIn + " days";
}

function getUpgradeDaysLeft(license) {
  if (license.license_status === "InvalidDueToExpiredUpgradeProtection") return " - expired";

  const expiringIn = useGetDayDiffFromToday(license.upgrade_protection_expiration);
  if (expiringIn <= 0) return " - expired";
  if (expiringIn === 0) return " - expiring today";
  if (expiringIn === 1) return " - 1 day left";
  return " - " + expiringIn + " days left";
}

function getLicense(emptyLicense) {
  return useFetchFromServiceControl("license?refresh=true")
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
      return emptyLicense;
    });
}
