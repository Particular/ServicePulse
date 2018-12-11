; (function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        licenseService,
        formatter,
        notifyService
    ) {
        var notifier = notifyService();
        var vm = this;

        vm.loadingData = true;

        function mapLicenseToVm(license) {
            vm.licenseType = license.license_type;
            vm.scInstanceName = license.instance_name;
            vm.formattedExpirationDate = formatter.formatDate(license.expiration_date);
            vm.expirationDaysLeft = formatter.getDayDiff(license.expiration_date);
            vm.formattedUpgradeProtectionExpiration =
                formatter.formatDate(license.upgrade_protection_expiration);
            vm.upgradeDaysLeft = formatter.getDayDiff(license.upgrade_protection_expiration);
        }

        function refreshData() {
            licenseService.getLicense().then((license) => {
                if (license.license_type) {
                    mapLicenseToVm(license);
                    vm.loadingData = false;
                }
            });
        }

        notifier.subscribe($scope, (_, response) => {
            mapLicenseToVm(response.license);
            vm.loadingData = false;
        }, 'LicenseUpdated');

        refreshData();
    }

    controller.$inject = [
        '$scope',
        'licenseService',
        'formatter',
        'notifyService'
    ];

    angular.module('configuration.license')
        .controller('LicenseController', controller);

}(window, window.angular));