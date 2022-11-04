import { ref } from "vue";
//import { useFetch } from "./fetch.js";

export const currentLicense = ref(null)

export function useLicense(serviceControlUrl) {
  getLicense(serviceControlUrl).then(lic => {
    currentLicense.value = lic
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

function getLicense(serviceControlUrl) {
    //const { data, error, retry } = useFetch(serviceControlUrl + 'license')            

    return fetch(serviceControlUrl + 'license').then(response => {
        return response.json();
    })
    .catch(err => {
        console.log(err)    
        var undefinedLicense = {
            edition: "",
            expiration_date: undefined,
            upgrade_protection_expiration: undefined,
            license_type: "",
            instance_name: "",
            trial_license: true,
            license_status:"Unavailable"
        }    
        return undefinedLicense
    });
}