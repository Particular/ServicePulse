import { ref } from "vue";
import { useFetch } from "./fetch.js";


export function useLicense(serviceControlUrl) {
  const license = ref(getLicense(serviceControlUrl))

  return license
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


function getLicense(serviceControlUrl) {
    const { data, error } = useFetch(serviceControlUrl + 'license')
    
    if (error) {     
        console.log(error)    
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
    }    
    return data.data
}