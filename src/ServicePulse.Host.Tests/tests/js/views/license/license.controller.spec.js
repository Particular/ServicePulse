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

    beforeEach(inject(function (_$controller_, $rootScope) {
        licenseController = _$controller_('LicenseController', { $scope: $rootScope });
    }));

    it('should populate the basic view model properties', () => {
        license = {
            trial_license: false,
            edition: 'Ultimate',
            registered_to: 'ACME Software',
            upgrade_protection_expiration: '',
            expiration_date: getDateFromNow(365).toISOString(),
            status: 'valid',
            license_type: 'Commercial',
            instance_name: 'Particular.ServiceControl',
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

    it('should report an expiring trial license', () => {
        var today = new Date();
        var twoDays = new Date();
        twoDays.setHours(0, 0, 0, 0);
        twoDays.setDate(today.getDate() + 2);
        license = {
            trial_license: true,
            expiration_date: getDateFromNow(2).toISOString(),
            license_status: 'ValidWithExpiringTrial'
        };
        licenseController.mapLicenseToVm(license);
        expect(licenseController.isTrialLicense).toBe(true);
        expect(licenseController.isExpiring).toBe(true);
        expect(licenseController.isSubscriptionLicense).toBe(false);
        expect(licenseController.isUpgradeProtectionLicense).toBe(false);
        expect(licenseController.expirationDaysLeft).toEqual(" - expiring in 2 days");
        expect(licenseController.expiredWarningType).toEqual("warning");

    });

});