import { ref, computed } from "vue";
import { useGetDayDiffFromToday } from "./formatter";

const subscriptionExpiring =
  '<div class="license-warning"><strong>Platform license expires soon</strong><div>Once the license expires you\'ll no longer be able to continue using the Particular Service Platform.</div><a href="/configuration#license" class="btn btn-license-warning">View license details</a></div>';
const upgradeProtectionExpiring =
  '<div class="license-warning"><strong>Upgrade protection expires soon</strong><div>Once upgrade protection expires, you\'ll no longer have access to support or new product versions</div><a href="/configuration#license" class="btn btn-license-warning">View license details</a></div>';
const upgradeProtectionExpired =
  '<div class="license-warning"><strong>Upgrade protection expired</strong><div>Once upgrade protection expires, you\'ll no longer have access to support or new product versions</div><a href="/configuration#license" class="btn btn-license-warning">View license details</a></div>';
const trialExpiring =
  '<div class="license-warning"><strong>Non-production development license expiring</strong><div>Your non-production development license will expire soon. To continue using the Particular Service Platform you\'ll need to extend your license.</div><a href="http://particular.net/extend-your-trial?p=servicepulse" class="btn btn-license-warning"><i class="fa fa-external-link-alt"></i> Extend your license</a><a href="/configuration#license" class="btn btn-license-warning-light">View license details</a></div>';

const license = ref({
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

const isPlatformExpired = computed(() => {
  return license.value
    ? license.value.license_status == "InvalidDueToExpiredSubscription"
    : false;
})

const isPlatformTrialExpired = computed(() => {
  return license.value
    ? license.value.license_status === "InvalidDueToExpiredTrial"
    : false;
});
const isInvalidDueToUpgradeProtectionExpired = computed(() => {
  return license.value
    ? license.value.license_status === "InvalidDueToExpiredUpgradeProtection"
    : false;
});

const isExpired = computed(() => {
  return (
    isPlatformExpired.value ||
    isPlatformTrialExpired.value ||
    isInvalidDueToUpgradeProtectionExpired.value
  );
})

export const licenseStatus = {
  isPlatformExpired : isPlatformExpired,
  isPlatformTrialExpired : isPlatformTrialExpired,
  isInvalidDueToUpgradeProtectionExpired : isInvalidDueToUpgradeProtectionExpired,
  isExpired : isExpired
}

export function useLicense(serviceControlUrl) {
  return getLicense(serviceControlUrl, license).then((lic) => {
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
  });
}

export function useIsValidWithWarning(licenseStatus) {
  return (
    licenseStatus === "ValidWithExpiringUpgradeProtection" ||
    licenseStatus === "ValidWithExpiringTrial" ||
    licenseStatus === "ValidWithExpiredUpgradeProtection" ||
    licenseStatus === "ValidWithExpiringSubscription"
  );
}

export function useLicenseWarningLevel(licenseStatus) {
  if (
    licenseStatus === "InvalidDueToExpiredTrial" ||
    licenseStatus === "InvalidDueToExpiredSubscription" ||
    licenseStatus === "InvalidDueToExpiredUpgradeProtection"
  )
    return "danger";
  else if (useIsValidWithWarning(licenseStatus)) return "warning";
  return "";
}

export function useIsUpgradeProtectionLicense(license) {
  return (
    license.upgrade_protection_expiration !== undefined &&
    license.upgrade_protection_expiration !== ""
  );
}

export function useIsSubscriptionLicense(license) {
  return (
    license.expiration_date !== undefined &&
    license.expiration_date !== "" &&
    !license.trial_license
  );
}

export function useIsExpiring(licenseStatus) {
  return (
    licenseStatus === "ValidWithExpiringSubscription" ||
    licenseStatus === "ValidWithExpiringTrial" ||
    licenseStatus === "ValidWithExpiringUpgradeProtection"
  );
}

export function useIsExpired(licenseStatus) {
  return (
    licenseStatus === "InvalidDueToExpiredTrial" ||
    licenseStatus === "InvalidDueToExpiredSubscription" ||
    licenseStatus === "ValidWithExpiredUpgradeProtection" ||
    licenseStatus === "InvalidDueToExpiredUpgradeProtection"
  );
}

export function useIsValid(licenseStatus) {
  return (
    licenseStatus !== "InvalidDueToExpiredTrial" &&
    licenseStatus !== "InvalidDueToExpiredSubscription" &&
    licenseStatus !== "InvalidDueToExpiredUpgradeProtection"
  );
}

export function useUpgradeDaysLeft(expirationDate, isValid) {
  return getUpgradeDaysLeft(expirationDate, isValid);
}

export function useExpirationDaysLeft(expirationDate, isValid, isExpiring) {
  return getExpirationDaysLeft(expirationDate, isValid, isExpiring);
}

export function useGetWarningMessage(licenseStatus, useShowToast) {
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
  }
}

function getExpirationDaysLeft(expirationDate, isValid, isExpiring) {
  if (!isValid) return " - expired";

  const expiringIn = useGetDayDiffFromToday(expirationDate);
  if (!isExpiring) return " - " + expiringIn + " days left";
  if (expiringIn === 0) return " - expiring today";
  if (expiringIn === 1) return " - expiring tomorrow";
  return " - expiring in " + expiringIn + " days";
}

function getUpgradeDaysLeft(expirationDate, isValid) {
  if (!isValid) return " - expired";

  const expiringIn = useGetDayDiffFromToday(expirationDate);
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
