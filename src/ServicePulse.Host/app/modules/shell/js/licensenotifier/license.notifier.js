require('angular');

class LicenseNotifierService {
    constructor(toastService) {
        this.toastService = toastService;
    }

    checkLicense() {
        const licenseStatus = 'ValidWithExpiredUpgradeProtection';// for testing. Should load this value.

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

            case 'InvalidDueToExpiredTrial':
                lockSystemBecauseTrialExpired();
                break;

            case 'InvalidDueToExpiredSubscription':
            case 'InvalidDueToExpiredUpgradeProtection':
                lockSystem()
                break;
        }
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

    lockSystemBecauseTrialExpired() {

    }

    lockSystem() {

    }
}

LicenseNotifierService.$inject = ['toastService'];

angular.module('licenseNotifierService', ['toaster'])
    .service('licenseNotifierService', LicenseNotifierService);