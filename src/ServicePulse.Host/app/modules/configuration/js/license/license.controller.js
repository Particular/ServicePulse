; (function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        licenseService,
        formatter,
        notifyService,
    ) {
        var notifier = notifyService();
        var vm = this;

        vm.loadingData = true;

        function mapLicenseToVm(license) {
            vm.licenseType = license.license_type;
            vm.scInstanceName = license.instance_name;
            vm.license_status = license.license_status;
            if (license.expiration_date) {
                vm.formattedExpirationDate = new Date(license.expiration_date.replace("Z", "")).toLocaleDateString();
            }
            if (license.upgrade_protection_expiration) {

                vm.formattedUpgradeProtectionExpiration =
                    new Date(license.upgrade_protection_expiration.replace("Z", "")).toLocaleDateString();
            }

            var status = license.license_status;
            vm.isTrialLicense = license.license_type === "Trial";
            vm.isUpgradeProtectionLicense = license.upgrade_protection_expiration !== "";
            vm.isSubscriptionLicense = license.expiration_date !== "" && !vm.isTrialLicense;
            vm.isExpiring = licenseMatches(status,
                "ValidWithExpiringSubscription",
                "ValidWithExpiringTrial",
                "ValidWithExpiringUpgradeProtection");
            vm.isExpired = licenseMatches(status,
                "InvalidDueToExpiredTrial",
                "InvalidDueToExpiredSubscription",
                "InvalidDueToExpiredUpgradeProtection");

            if (vm.isExpiring || (vm.isExpired && vm.isUpgradeProtectionLicense)) {
                vm.expiredWarningType = "warning";
            } else if (vm.isExpired) {
                vm.expiredWarningType = "danger";
            }

            vm.expirationDaysLeft = vm.isExpired ? " - expired" : formatter.getDayDiffFromToday(license.expiration_date);
            vm.upgradeDaysLeft =
                vm.isExpired ? " - expired" : formatter.getDayDiffFromToday(license.upgrade_protection_expiration);
        }

        function licenseMatches(status) {
            for (var i = 1; i < arguments.length; i++) {
                if (status === arguments[i]) return true;
            }
            return false;
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
        'notifyService',
    ];

    angular.module('configuration.license')
        .controller('LicenseController', controller);

}(window, window.angular));