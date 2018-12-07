; (function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        sharedDataService,
        formatter
    ) {
        var vm = this;

        var license = sharedDataService.getlicense();

        vm.licenseType = license.license_type;
        vm.scInstanceName = license.instance_name;
        vm.formattedExpirationDate = formatter.formatDate(license.expiration_date);
        vm.expirationDaysLeft = formatter.getDayDiff(license.expiration_date);
        vm.formattedUpgradeProtectionExpiration = formatter.formatDate(license.upgrade_protection_expiration);
        vm.upgradeDaysLeft = formatter.getDayDiff(license.upgrade_protection_expiration);
    }

    controller.$inject = [
        '$scope',
        'sharedDataService',
        'formatter'
    ];

    angular.module('configuration.license')
        .controller('LicenseController', controller);

}(window, window.angular));