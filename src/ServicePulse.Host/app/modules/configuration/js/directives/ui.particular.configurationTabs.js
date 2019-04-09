; (function (window, angular, $, undefined) {
    'use strict';

    angular.module('configuration', []);

    function controller($scope, $location, redirectService, notifyService, sharedDataService, licenseService, licenseNotifierService) {
        var notifier = notifyService();

        $scope.isActive = (viewLocation) => viewLocation === $location.path();
        
        var stats = sharedDataService.getstats();

        $scope.counters = {
            endpoints: stats.number_of_endpoints,
            redirects: 0
        };

        redirectService.getTotalRedirects().then((data) => {
            $scope.counters.redirects = data;
        });

        notifier.subscribe($scope, (event, data) => {
            $scope.counters.redirects = data;
        }, 'RedirectMessageCountUpdated');

        notifier.subscribe($scope, (event, data) => {
            $scope.counters.endpoints = data;
        }, 'EndpointCountUpdated');

        notifier.subscribe($scope, (event, data) => {
            $scope.isSCConnected = data.isSCConnected;
            $scope.isSCConnecting = data.isSCConnecting;
            $scope.scConnectedAtLeastOnce= data.scConnectedAtLeastOnce;
        }, 'ServiceControlConnectionStatusChanged');

        licenseService.getLicense().then((license) => {
            $scope.isExpired = licenseNotifierService.isPlatformExpired(license.license_status) ||
                licenseNotifierService.isPlatformTrialExpired(license.license_status) ||
                licenseNotifierService.isInvalidDueToUpgradeProtectionExpired(license.license_status);

            if (licenseNotifierService.isValidWithWarning(license.license_status)) {
                $scope.licensewarning = 'warning';
            }

            if ($scope.isExpired) {
                $scope.licensewarning = 'danger';
            }
        });
    }
    
    controller.$inject = ['$scope', '$location', 'redirectService', 'notifyService', 'sharedDataService',
        'licenseService', 'licenseNotifierService'];

    function directive() {
        const template = require('./ui.particular.configurationTabs.tpl.html');

        return {
            scope: {},
            restrict: 'E',
            replace: true,
            template: template,
            controller: controller,
            link: function (scope, element) { }
        };
    }

    directive.$inject = [];

    angular
        .module('configuration.tabs', [])
        .directive('configurationTabs', directive);

}(window, window.angular, window.jQuery));
