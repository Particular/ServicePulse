import { computed, reactive, watch } from "vue";
import { useGetDayDiffFromToday } from "./formatter";
import { useFetchFromServiceControl } from "./serviceServiceControlUrls";
import { useShowToast } from "./toast";
import { TYPE } from "vue-toastification";

const subscriptionExpiring =
  '<div class="license-warning"><strong>Platform license expires soon</strong><div>Once the license expires you\'ll no longer be able to continue using the Particular Service Platform.</div><a href="#/configuration" class="btn btn-license-warning">View license details</a></div>';
const upgradeProtectionExpiring =
  '<div class="license-warning"><strong>Upgrade protection expires soon</strong><div>Once upgrade protection expires, you\'ll no longer have access to support or new product versions</div><a href="#/configuration" class="btn btn-license-warning">View license details</a></div>';
const upgradeProtectionExpired =
  '<div class="license-warning"><strong>Upgrade protection expired</strong><div>Once upgrade protection expires, you\'ll no longer have access to support or new product versions</div><a href="#/configuration" class="btn btn-license-warning">View license details</a></div>';
const trialExpiring =
  '<div class="license-warning"><strong>Non-production development license expiring</strong><div>Your non-production development license will expire soon. To continue using the Particular Service Platform you\'ll need to extend your license.</div><a href="http://particular.net/extend-your-trial?p=servicepulse" class="btn btn-license-warning"><i class="fa fa-external-link-alt"></i> Extend your license</a><a href="#/configuration" class="btn btn-license-warning-light">View license details</a></div>';

interface License {
  edition: string;
  licenseEdition: string;
  expiration_date: string;
  formattedExpirationDate: string;
  upgrade_protection_expiration: string;
  formattedUpgradeProtectionExpiration: string;
  license_type: string;
  instance_name: string;
  formattedInstanceName: string;
  trial_license: boolean;
  license_status: LicenseStatus;
}

enum LicenseStatus {
  Unavailable = "Unavailable",
  InvalidDueToExpiredSubscription = "InvalidDueToExpiredSubscription",
  ValidWithExpiringTrial = "ValidWithExpiringTrial",
  InvalidDueToExpiredTrial = "InvalidDueToExpiredTrial",
  InvalidDueToExpiredUpgradeProtection = "InvalidDueToExpiredUpgradeProtection",
  ValidWithExpiredUpgradeProtection = "ValidWithExpiredUpgradeProtection",
  ValidWithExpiringUpgradeProtection = "ValidWithExpiringUpgradeProtection",
  ValidWithExpiringSubscription = "ValidWithExpiringSubscription",
}

const emptyLicense = {
  edition: "",
  licenseEdition: "",
  expiration_date: "",
  formattedExpirationDate: "",
  upgrade_protection_expiration: "",
  formattedUpgradeProtectionExpiration: "",
  license_type: "",
  instance_name: "",
  formattedInstanceName: "",
  trial_license: true,
  license_status: LicenseStatus.Unavailable,
};

export let license = reactive<License>(emptyLicense);

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

export async function useLicense() {
  watch<License>(license, async (newValue, oldValue) => {
    const checkForWarnings = oldValue !== null ? newValue && newValue.license_status != oldValue.license_status : newValue !== null;
    if (checkForWarnings) {
      displayWarningMessage(newValue.license_status);
    }
  });

  license = await getLicense();
  license.licenseEdition = computed(() => {
    return license.license_type && license.edition ? ", " + license.edition : "";
  }).value;
  license.formattedInstanceName = computed(() => {
    return license.instance_name || "Upgrade ServiceControl to v3.4.0+ to see more information about this license";
  }).value;
  license.formattedExpirationDate = computed(() => {
    return license.expiration_date ? new Date(license.expiration_date.replace("Z", "")).toLocaleDateString() : "";
  }).value;
  license.formattedUpgradeProtectionExpiration = computed<string>(() => {
    return license.upgrade_protection_expiration ? new Date(license.upgrade_protection_expiration.replace("Z", "")).toLocaleDateString() : "";
  }).value;
  licenseStatus.isSubscriptionLicense = isSubscriptionLicense(license);
  licenseStatus.isUpgradeProtectionLicense = isUpgradeProtectionLicense(license);
  licenseStatus.isTrialLicense = license.trial_license;
  licenseStatus.isPlatformExpired = license.license_status === "InvalidDueToExpiredSubscription";
  licenseStatus.isPlatformTrialExpiring = license.license_status === "ValidWithExpiringTrial";
  licenseStatus.isPlatformTrialExpired = license.license_status === "InvalidDueToExpiredTrial";
  licenseStatus.isInvalidDueToUpgradeProtectionExpired = license.license_status === "InvalidDueToExpiredUpgradeProtection";
  licenseStatus.isValidWithExpiredUpgradeProtection = license.license_status === "ValidWithExpiredUpgradeProtection";
  licenseStatus.isValidWithExpiringUpgradeProtection = license.license_status === "ValidWithExpiringUpgradeProtection";
  licenseStatus.upgradeDaysLeft = getUpgradeDaysLeft(license);
  licenseStatus.subscriptionDaysLeft = getSubscriptionDaysLeft(license);
  licenseStatus.trialDaysLeft = getTrialDaysLeft(license);
  licenseStatus.warningLevel = getLicenseWarningLevel(license.license_status);
  licenseStatus.isExpired = licenseStatus.isPlatformExpired || licenseStatus.isPlatformTrialExpired || licenseStatus.isInvalidDueToUpgradeProtectionExpired;
}

function getLicenseWarningLevel(licenseStatus: LicenseStatus) {
  if (licenseStatus === "InvalidDueToExpiredTrial" || licenseStatus === "InvalidDueToExpiredSubscription" || licenseStatus === "InvalidDueToExpiredUpgradeProtection") return "danger";
  else if (licenseStatus === "ValidWithExpiringUpgradeProtection" || licenseStatus === "ValidWithExpiringTrial" || licenseStatus === "ValidWithExpiredUpgradeProtection" || licenseStatus === "ValidWithExpiringSubscription") return "warning";
  return "";
}

function isUpgradeProtectionLicense(license: License) {
  return license.upgrade_protection_expiration !== undefined && license.upgrade_protection_expiration !== "";
}

function isSubscriptionLicense(license: License) {
  return license.expiration_date !== undefined && license.expiration_date !== "" && !license.trial_license;
}

function displayWarningMessage(licenseStatus: LicenseStatus) {
  switch (licenseStatus) {
    case "ValidWithExpiredUpgradeProtection":
      useShowToast(TYPE.WARNING, "", upgradeProtectionExpired, true);
      break;

    case "ValidWithExpiringTrial":
      useShowToast(TYPE.WARNING, "", trialExpiring, true);
      break;

    case "ValidWithExpiringSubscription":
      useShowToast(TYPE.WARNING, "", subscriptionExpiring, true);
      break;

    case "ValidWithExpiringUpgradeProtection":
      useShowToast(TYPE.WARNING, "", upgradeProtectionExpiring, true);
      break;

    case "InvalidDueToExpiredTrial":
    case "InvalidDueToExpiredSubscription":
    case "InvalidDueToExpiredUpgradeProtection":
      useShowToast(TYPE.ERROR, "Error", 'Your license has expired. Please contact Particular Software support at: <a href="http://particular.net/support">http://particular.net/support</a>', true);
      break;
  }
}

function getSubscriptionDaysLeft(license: License) {
  if (license.license_status === "InvalidDueToExpiredSubscription") return " - expired";

  const isExpiring = license.license_status === "ValidWithExpiringSubscription";

  const expiringIn = useGetDayDiffFromToday(license.expiration_date);
  if (!isExpiring) return " - " + expiringIn + " days left";
  if (expiringIn === 0) return " - expiring today";
  if (expiringIn === 1) return " - expiring tomorrow";
  return " - expiring in " + expiringIn + " days";
}

function getTrialDaysLeft(license: License) {
  if (license.license_status === "InvalidDueToExpiredTrial") return " - expired";

  const isExpiring = license.license_status === "ValidWithExpiringTrial";

  const expiringIn = useGetDayDiffFromToday(license.expiration_date);
  if (!isExpiring) return " - " + expiringIn + " days left";
  if (expiringIn === 0) return " - expiring today";
  if (expiringIn === 1) return " - expiring tomorrow";
  return " - expiring in " + expiringIn + " days";
}

function getUpgradeDaysLeft(license: License) {
  if (license.license_status === "InvalidDueToExpiredUpgradeProtection") return " - expired";

  const expiringIn = useGetDayDiffFromToday(license.upgrade_protection_expiration);
  if (expiringIn <= 0) return " - expired";
  if (expiringIn === 0) return " - expiring today";
  if (expiringIn === 1) return " - 1 day left";
  return " - " + expiringIn + " days left";
}

async function getLicense() {
  try {
    let response = await useFetchFromServiceControl("license?refresh=true");
    return response.json();
  } catch (err) {
    console.log(err);
    return emptyLicense;
  }
}
