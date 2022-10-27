var angular = require('angular');

class LicenseNotifierService {
    constructor(toastService) {
        this.toastService = toastService;
    }

    warnOfLicenseProblem(licenseStatus) {
        switch (licenseStatus) {
            case 'ValidWithExpiredUpgradeProtection':
                this.warnOfExpiredUpgradeProtection();
                break;

            case 'ValidWithExpiringTrial':
                this.warnOfExpiringTrial();
                break;

            case 'ValidWithExpiringSubscription':
                this.warnOfExpiringSubscription();
                break;

            case 'ValidWithExpiringUpgradeProtection':
                this.warnOfExpiringUpgradeProtection();
                break;
        }
    }

    isValidWithWarning(licenseStatus) {
        return licenseStatus === 'ValidWithExpiringUpgradeProtection' ||
            licenseStatus === 'ValidWithExpiringTrial' ||
            licenseStatus === 'ValidWithExpiredUpgradeProtection' ||
            licenseStatus === 'ValidWithExpiringSubscription';
    }

    isPlatformTrialExpired(licenseStatus) {
        return licenseStatus === 'InvalidDueToExpiredTrial';
    }

    isPlatformExpired(licenseStatus) {
        return licenseStatus === 'InvalidDueToExpiredSubscription';
    }

    isInvalidDueToUpgradeProtectionExpired(licenseStatus) {
        return licenseStatus === 'InvalidDueToExpiredUpgradeProtection';
    }

    warnOfExpiredUpgradeProtection() {
        const template = require('./upgradeprotectionexpired.html');
        this.toastService.showWarning(template, true, false);
    }

    warnOfExpiringTrial() {
        const template = require('./trialexpiring.html');
        this.toastService.showWarning(template, true, false);
    }

    warnOfExpiringSubscription() {
        const template = require('./subscriptionexpiring.html');
        this.toastService.showWarning(template, true, false);
    }

    warnOfExpiringUpgradeProtection() {
        const template = require('./upgradeprotectionexpiring.html');
        this.toastService.showWarning(template, true, false);
    }
}

LicenseNotifierService.$inject = ['toastService'];

angular.module('licenseNotifierService', ['toaster'])
    .service('licenseNotifierService', LicenseNotifierService);