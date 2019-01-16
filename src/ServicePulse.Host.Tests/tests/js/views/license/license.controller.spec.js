describe('licenseController',  () => {
    beforeEach(function () {
        module('ngRoute');
        module('sc');
        module('configuration.license');
    });

    var licenseController;

    function getDateFromNow(numDays) {
        var today = new Date();
        var nextDate = new Date();
        nextDate.setHours(0, 0, 0, 0);
        nextDate.setDate(today.getDate() + numDays);

        return nextDate;
    }

    function getBasicLicense() {
        return {
            edition: 'Ultimate',
            registered_to: 'ACME Software',
            license_type: 'Commercial',
            instance_name: 'Particular.ServiceControl'
        };
    }

    beforeEach(inject(function (_$controller_, $rootScope) {
        licenseController = _$controller_('LicenseController', { $scope: $rootScope });
    }));

    it('should populate the basic view model properties', () => {
        let license = {
            ...getBasicLicense(),
            trial_license: false,
            expiration_date: getDateFromNow(365).toISOString(),
            status: 'valid',
            license_status: 'Valid'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.license_status).toEqual('Valid');
        expect(licenseController.licenseEdition).toEqual(', Ultimate');
        expect(licenseController.licenseType).toEqual('Commercial');
        expect(licenseController.scInstanceName).toEqual('Particular.ServiceControl');
        expect(licenseController.expirationDaysLeft).toEqual(" - 365 days left");
        expect(licenseController.expiredWarningType).toBeUndefined();
    });

    it('should report a valid trial license', () => {
        license = {
            ...getBasicLicense(),
            trial_license: true,
            expiration_date: getDateFromNow(6).toISOString(),
            license_status: 'Valid'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.isTrialLicense).toBe(true);
        expect(licenseController.isExpiring).toBe(false);
        expect(licenseController.isExpired).toBe(false);
        expect(licenseController.isSubscriptionLicense).toBe(false);
        expect(licenseController.isUpgradeProtectionLicense).toBe(false);
        expect(licenseController.expirationDaysLeft).toEqual(" - 6 days left");
        expect(licenseController.expiredWarningType).toBeUndefined();
    });

    it('should report an expiring trial license', () => {
        license = {
            ...getBasicLicense(),
            trial_license: true,
            expiration_date: getDateFromNow(2).toISOString(),
            license_status: 'ValidWithExpiringTrial'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.isTrialLicense).toBe(true);
        expect(licenseController.isExpiring).toBe(true);
        expect(licenseController.isExpired).toBe(false);
        expect(licenseController.isSubscriptionLicense).toBe(false);
        expect(licenseController.isUpgradeProtectionLicense).toBe(false);
        expect(licenseController.expirationDaysLeft).toEqual(" - expiring in 2 days");
        expect(licenseController.expiredWarningType).toEqual("warning");
    });

    it('should report an expired trial license', () => {
        license = {
            ...getBasicLicense(),
            trial_license: true,
            expiration_date: getDateFromNow(-1).toISOString(),
            license_status: 'InvalidDueToExpiredTrial'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.isTrialLicense).toBe(true);
        expect(licenseController.isExpiring).toBe(false);
        expect(licenseController.isExpired).toBe(true);
        expect(licenseController.isSubscriptionLicense).toBe(false);
        expect(licenseController.isUpgradeProtectionLicense).toBe(false);
        expect(licenseController.expirationDaysLeft).toEqual(" - expired");
        expect(licenseController.expiredWarningType).toEqual("danger");
    });

    it('should report a valid subscription license', () => {
        license = {
            ...getBasicLicense(),
            trial_license: false,
            expiration_date: getDateFromNow(11).toISOString(),
            license_status: 'Valid'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.isTrialLicense).toBe(false);
        expect(licenseController.isExpiring).toBe(false);
        expect(licenseController.isExpired).toBe(false);
        expect(licenseController.isSubscriptionLicense).toBe(true);
        expect(licenseController.isUpgradeProtectionLicense).toBe(false);
        expect(licenseController.expirationDaysLeft).toEqual(" - 11 days left");
        expect(licenseController.expiredWarningType).toBeUndefined();
    });

    it('should report an expiring subscription license', () => {
        license = {
            ...getBasicLicense(),
            trial_license: false,
            expiration_date: getDateFromNow(1).toISOString(),
            license_status: 'ValidWithExpiringSubscription'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.isTrialLicense).toBe(false);
        expect(licenseController.isExpiring).toBe(true);
        expect(licenseController.isExpired).toBe(false);
        expect(licenseController.isSubscriptionLicense).toBe(true);
        expect(licenseController.isUpgradeProtectionLicense).toBe(false);
        expect(licenseController.expirationDaysLeft).toEqual(" - expiring tomorrow");
        expect(licenseController.expiredWarningType).toEqual("warning");
    });

    it('should report an expired subscription license', () => {
        license = {
            ...getBasicLicense(),
            trial_license: false,
            expiration_date: getDateFromNow(-1).toISOString(),
            license_status: 'InvalidDueToExpiredSubscription'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.isTrialLicense).toBe(false);
        expect(licenseController.isExpiring).toBe(false);
        expect(licenseController.isExpired).toBe(true);
        expect(licenseController.isSubscriptionLicense).toBe(true);
        expect(licenseController.isUpgradeProtectionLicense).toBe(false);
        expect(licenseController.expirationDaysLeft).toEqual(" - expired");
        expect(licenseController.expiredWarningType).toEqual("danger");
    });

    it('should report a valid upgrade protection license', () => {
        license = {
            ...getBasicLicense(),
            trial_license: false,
            upgrade_protection_expiration: getDateFromNow(11).toISOString(),
            license_status: 'Valid'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.isTrialLicense).toBe(false);
        expect(licenseController.isExpiring).toBe(false);
        expect(licenseController.isExpired).toBe(false);
        expect(licenseController.isSubscriptionLicense).toBe(false);
        expect(licenseController.isUpgradeProtectionLicense).toBe(true);
        expect(licenseController.upgradeDaysLeft).toEqual(" - 11 days left");
        expect(licenseController.expiredWarningType).toBeUndefined();
    });

    it('should report an expiring upgrade protection license', () => {
        license = {
            ...getBasicLicense(),
            trial_license: false,
            upgrade_protection_expiration: getDateFromNow(1).toISOString(),
            license_status: 'ValidWithExpiringUpgradeProtection'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.isTrialLicense).toBe(false);
        expect(licenseController.isExpiring).toBe(true);
        expect(licenseController.isExpired).toBe(false);
        expect(licenseController.isSubscriptionLicense).toBe(false);
        expect(licenseController.isUpgradeProtectionLicense).toBe(true);
        expect(licenseController.upgradeDaysLeft).toEqual(" - 1 day left");
        expect(licenseController.expiredWarningType).toEqual("warning");
    });

    it('should report an expired upgrade protection license', () => {
        license = {
            ...getBasicLicense(),
            trial_license: false,
            upgrade_protection_expiration: getDateFromNow(0).toISOString(),
            license_status: 'InvalidDueToExpiredUpgradeProtection'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.isTrialLicense).toBe(false);
        expect(licenseController.isExpiring).toBe(false);
        expect(licenseController.isExpired).toBe(true);
        expect(licenseController.isSubscriptionLicense).toBe(false);
        expect(licenseController.isUpgradeProtectionLicense).toBe(true);
        expect(licenseController.upgradeDaysLeft).toEqual(" - expired");
        expect(licenseController.expiredWarningType).toEqual("danger");
    });

    it('should show "today" when expiring today', () => {
        license = {
            ...getBasicLicense(),
            trial_license: false,
            expiration_date: getDateFromNow(0).toISOString(),
            license_status: 'ValidWithExpiringSubscription'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.isTrialLicense).toBe(false);
        expect(licenseController.isExpiring).toBe(true);
        expect(licenseController.isExpired).toBe(false);
        expect(licenseController.isSubscriptionLicense).toBe(true);
        expect(licenseController.isUpgradeProtectionLicense).toBe(false);
        expect(licenseController.expirationDaysLeft).toEqual(" - expiring today");
        expect(licenseController.expiredWarningType).toEqual("warning");
    });
});