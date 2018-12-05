;
(function(window, angular, undefined) {

    'use strict';

    function controller(
        $scope,
        sharedDataService,
        formatter
        ) {

        var license = sharedDataService.getlicense();

        $scope.model = {
            licenseType: "Commercial",
            scInstanceName: "BLAH@MACHINENAME",
            formattedExpirationDate: formatter.formatDate(license.expiration_date),
            expirationDaysLeft: formatter.getDayDiff(license.expiration_date),
            formattedUpgradeProtectionExpiration: formatter.formatDate(license.upgrade_protection_expiration),
            upgradeDaysLeft: formatter.getDayDiff(license.upgrade_protection_expiration)
        };

    }

    controller.$inject = [
        '$scope',
        'sharedDataService',
        'formatter'
    ];

    angular.module('license')
        .controller('LicenseCtrl', controller);

}(window, window.angular));