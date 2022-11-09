//import { useFetch } from "./fetch.js";
import { ref, computed } from "vue";
import { useGetDayDiffFromToday } from "./formatter"

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
    license_status:"Unavailable"
})


export function useLicense(serviceControlUrl) {
  return getLicense(serviceControlUrl, license).then(lic => {
    license.value = lic
    license.value.licenseEdition = computed(() => { return license.value.license_type && license.value.edition ? ', ' + license.value.edition : ''})
    license.value.formattedInstanceName = computed(() => { return license.value.instance_name || 'Upgrade ServiceControl to v3.4.0+ to see more information about this license'});
    license.value.formattedExpirationDate = computed(() => { return license.value.expiration_date ? new Date(license.value.expiration_date.replace('Z', '')).toLocaleDateString() : ''})
    license.value.formattedUpgradeProtectionExpiration = computed(() => { return license.value.upgrade_protection_expiration ? new Date(license.value.upgrade_protection_expiration.replace('Z', '')).toLocaleDateString() : ''})
    return license
  })
}

export function useIsValidWithWarning(licenseStatus) {
    return licenseStatus === 'ValidWithExpiringUpgradeProtection' ||
        licenseStatus === 'ValidWithExpiringTrial' ||
        licenseStatus === 'ValidWithExpiredUpgradeProtection' ||
        licenseStatus === 'ValidWithExpiringSubscription';
}

export function useIsPlatformTrialExpired(licenseStatus) {
    return licenseStatus === 'InvalidDueToExpiredTrial';
}

export function useIsPlatformExpired(licenseStatus) {
    return licenseStatus === 'InvalidDueToExpiredSubscription';
}

export function useIsInvalidDueToUpgradeProtectionExpired(licenseStatus) {
    return licenseStatus === 'InvalidDueToExpiredUpgradeProtection';
}

export function useLicenseWarningLevel(licenseStatus) {
    if (licenseStatus === 'InvalidDueToExpiredTrial' || licenseStatus === 'InvalidDueToExpiredSubscription' ||  licenseStatus === 'InvalidDueToExpiredUpgradeProtection')
        return "danger"
    else if (useIsValidWithWarning(licenseStatus))
        return "warning"
    return ''
}

export function useIsUpgradeProtectionLicense(license) {
    return license.upgrade_protection_expiration !== undefined && license.upgrade_protection_expiration !== ''
}

export function useIsSubscriptionLicense(license) {
    return license.expiration_date !== undefined && license.expiration_date !== "" && !license.trial_license
}

export function useIsExpiring(licenseStatus) {
    return licenseStatus === 'ValidWithExpiringSubscription' ||
        licenseStatus === 'ValidWithExpiringTrial' ||
        licenseStatus === 'ValidWithExpiringUpgradeProtection'
}

export function useIsExpired(licenseStatus) {
    return licenseStatus === 'InvalidDueToExpiredTrial' ||
        licenseStatus === 'InvalidDueToExpiredSubscription' ||
        licenseStatus === 'ValidWithExpiredUpgradeProtection' ||
        licenseStatus === 'InvalidDueToExpiredUpgradeProtection'
}

export function useIsValid(licenseStatus) {
    return licenseStatus !== 'InvalidDueToExpiredTrial' &&
        licenseStatus !== 'InvalidDueToExpiredSubscription' &&
        licenseStatus !== 'InvalidDueToExpiredUpgradeProtection'
}

export function useUpgradeDaysLeft(expirationDate, isValid) {
    return getUpgradeDaysLeft(expirationDate, isValid);
}

export function useExpirationDaysLeft(expirationDate, isValid, isExpiring) {
    return getExpirationDaysLeft(expirationDate, isValid, isExpiring);
}


function getExpirationDaysLeft(expirationDate, isValid, isExpiring) {
    if (!isValid) return ' - expired';
    
    const expiringIn = useGetDayDiffFromToday(expirationDate);
    if (!isExpiring) return ' - ' + expiringIn + ' days left';
    if (expiringIn === 0) return ' - expiring today';
    if (expiringIn === 1) return ' - expiring tomorrow';
    return ' - expiring in ' + expiringIn + ' days';
}

function getUpgradeDaysLeft(expirationDate, isValid)
{
    if (!isValid) return ' - expired';

    const expiringIn = useGetDayDiffFromToday(expirationDate);
    if (expiringIn <= 0) return ' - expired';
    if (expiringIn === 0) return ' - expiring today';
    if (expiringIn === 1) return ' - 1 day left';
    return ' - ' + expiringIn + ' days left';
}

function getLicense(serviceControlUrl, emptyLicense) {
    //const { data, error, retry } = useFetch(serviceControlUrl + 'license')

    return fetch(serviceControlUrl + 'license').then(response => {
        return response.json();
    })
    .catch(err => {
        console.log(err)
        return emptyLicense
    });
}