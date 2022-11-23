import { ref, reactive, computed, watch } from "vue";
import { useGetDayDiffFromToday } from "./formatter";
import { useShowToast } from "./toast.js";

const subscriptionExpiring =
  '<div class="license-warning"><strong>Platform license expires soon</strong><div>Once the license expires you\'ll no longer be able to continue using the Particular Service Platform.</div><a href="/configuration#license" class="btn btn-license-warning">View license details</a></div>';
const upgradeProtectionExpiring =
  '<div class="license-warning"><strong>Upgrade protection expires soon</strong><div>Once upgrade protection expires, you\'ll no longer have access to support or new product versions</div><a href="/configuration#license" class="btn btn-license-warning">View license details</a></div>';
const upgradeProtectionExpired =
  '<div class="license-warning"><strong>Upgrade protection expired</strong><div>Once upgrade protection expires, you\'ll no longer have access to support or new product versions</div><a href="/configuration#license" class="btn btn-license-warning">View license details</a></div>';
const trialExpiring =
  '<div class="license-warning"><strong>Non-production development license expiring</strong><div>Your non-production development license will expire soon. To continue using the Particular Service Platform you\'ll need to extend your license.</div><a href="http://particular.net/extend-your-trial?p=servicepulse" class="btn btn-license-warning"><i class="fa fa-external-link-alt"></i> Extend your license</a><a href="/configuration#license" class="btn btn-license-warning-light">View license details</a></div>';

export const license = ref({
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

export const useLicenseStatus = reactive({
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

export function useLicense(serviceControlUrl) {
  watch(license, async (newValue, oldValue) => {
    const checkForWarnings =
      oldValue !== null
        ? newValue && newValue.license_status != oldValue.license_status
        : newValue !== null;
    if (checkForWarnings) {
      displayWarningMessage(newValue.license_status);
    }
  });

  return getLicense(serviceControlUrl, license)
    .then((lic) => {
      license.value = lic;
      license.value.licenseEdition = computed(() => {
        return license.value.license_type && license.value.edition
          ? ", " + license.value.edition
          : "";
      });
      license.value.formattedInstanceName = computed(() => {
        return (
          license.value.instance_name ||
          "Upgrade ServiceControl to v3.4.0+ to see more information about this license"
        );
      });
      license.value.formattedExpirationDate = computed(() => {
        return license.value.expiration_date
          ? new Date(
              license.value.expiration_date.replace("Z", "")
            ).toLocaleDateString()
          : "";
      });
      license.value.formattedUpgradeProtectionExpiration = computed(() => {
        return license.value.upgrade_protection_expiration
          ? new Date(
              license.value.upgrade_protection_expiration.replace("Z", "")
            ).toLocaleDateString()
          : "";
      });
      return license;
    })
    .then((lic) => {
      useLicenseStatus.isSubscriptionLicense = isSubscriptionLicense(lic.value);
      useLicenseStatus.isUpgradeProtectionLicense = isUpgradeProtectionLicense(
        lic.value
      );
      useLicenseStatus.isTrialLicense = lic.value.trial_license;
      useLicenseStatus.isPlatformExpired =
        lic.value.license_status === "InvalidDueToExpiredSubscription";
      useLicenseStatus.isPlatformTrialExpiring =
        lic.value.license_status === "ValidWithExpiringTrial";
      useLicenseStatus.isPlatformTrialExpired =
        lic.value.license_status === "InvalidDueToExpiredTrial";
      useLicenseStatus.isInvalidDueToUpgradeProtectionExpired =
        lic.value.license_status === "InvalidDueToExpiredUpgradeProtection";
      useLicenseStatus.isValidWithExpiredUpgradeProtection =
        lic.value.license_status === "ValidWithExpiredUpgradeProtection";
      useLicenseStatus.isValidWithExpiringUpgradeProtection =
        lic.value.license_status === "ValidWithExpiringUpgradeProtection";
      useLicenseStatus.upgradeDaysLeft = getUpgradeDaysLeft(lic.value);
      useLicenseStatus.subscriptionDaysLeft = getSubscriptionDaysLeft(
        lic.value
      );
      useLicenseStatus.trialDaysLeft = getTrialDaysLeft(lic.value);
      useLicenseStatus.warningLevel = getLicenseWarningLevel(
        lic.value.license_status
      );
      useLicenseStatus.isExpired =
        useLicenseStatus.isPlatformExpired ||
        useLicenseStatus.isPlatformTrialExpired ||
        useLicenseStatus.isInvalidDueToUpgradeProtectionExpired;
      return lic;
    });
}

export function getLicenseWarningLevel(licenseStatus) {
  if (
    licenseStatus === "InvalidDueToExpiredTrial" ||
    licenseStatus === "InvalidDueToExpiredSubscription" ||
    licenseStatus === "InvalidDueToExpiredUpgradeProtection"
  )
    return "danger";
  else if (
    licenseStatus === "ValidWithExpiringUpgradeProtection" ||
    licenseStatus === "ValidWithExpiringTrial" ||
    licenseStatus === "ValidWithExpiredUpgradeProtection" ||
    licenseStatus === "ValidWithExpiringSubscription"
  )
    return "warning";
  return "";
}

function isUpgradeProtectionLicense(license) {
  return (
    license.upgrade_protection_expiration !== undefined &&
    license.upgrade_protection_expiration !== ""
  );
}

function isSubscriptionLicense(license) {
  return (
    license.expiration_date !== undefined &&
    license.expiration_date !== "" &&
    !license.trial_license
  );
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
      useShowToast(
        "error",
        "Error",
        'Your license has expired. Please contact Particular Software support at: <a href="http://particular.net/support">http://particular.net/support</a>',
        true
      );
      break;
  }
}

function getSubscriptionDaysLeft(license) {
  if (license.license_status === "InvalidDueToExpiredSubscription")
    return " - expired";

  const isExpiring = license.license_status === "ValidWithExpiringSubscription";

  const expiringIn = useGetDayDiffFromToday(license.expiration_date);
  if (!isExpiring) return " - " + expiringIn + " days left";
  if (expiringIn === 0) return " - expiring today";
  if (expiringIn === 1) return " - expiring tomorrow";
  return " - expiring in " + expiringIn + " days";
}

function getTrialDaysLeft(license) {
  if (license.license_status === "InvalidDueToExpiredTrial")
    return " - expired";

  const isExpiring = license.license_status === "ValidWithExpiringTrial";

  const expiringIn = useGetDayDiffFromToday(license.expiration_date);
  if (!isExpiring) return " - " + expiringIn + " days left";
  if (expiringIn === 0) return " - expiring today";
  if (expiringIn === 1) return " - expiring tomorrow";
  return " - expiring in " + expiringIn + " days";
}

function getUpgradeDaysLeft(license) {
  if (license.license_status === "InvalidDueToExpiredUpgradeProtection")
    return " - expired";

  const expiringIn = useGetDayDiffFromToday(
    license.upgrade_protection_expiration
  );
  if (expiringIn <= 0) return " - expired";
  if (expiringIn === 0) return " - expiring today";
  if (expiringIn === 1) return " - 1 day left";
  return " - " + expiringIn + " days left";
}

function getLicense(serviceControlUrl, emptyLicense) {
  return fetch(serviceControlUrl + "license?refresh=true")
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
      return emptyLicense;
    });
}
