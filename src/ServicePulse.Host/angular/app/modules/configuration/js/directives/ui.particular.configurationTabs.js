 (function (window, angular, $) {
    'use strict';

    angular.module('configuration', []);

    function controller($scope, $location, redirectService, notifyService, sharedDataService, licenseService, licenseNotifierService, connectionsStatus, connectionsManager) {
        var notifier = notifyService();

        var isMonitoringEnabled = connectionsManager.getIsMonitoringEnabled();

        $scope.isActive = (viewLocation) => viewLocation === $location.path();
        
        $scope.connectionsStatus = connectionsStatus;
        $scope.unableToConnectToServiceControl = undefined;
        $scope.unableToConnectToMonitoring = undefined;

        var evalConnectionsStatus = function() {
            if (connectionsStatus.isSCConnecting) {
                $scope.unableToConnectToServiceControl = false;
            } else {
                $scope.unableToConnectToServiceControl = !connectionsStatus.isSCConnected;
            }
            
            if (!isMonitoringEnabled || connectionsStatus.isMonitoringConnecting || connectionsStatus.isMonitoringConnecting === undefined) {
                $scope.unableToConnectToMonitoring = false;
            } else {
                $scope.unableToConnectToMonitoring = !connectionsStatus.isMonitoringConnected;
            }
        }

        notifier.subscribe($scope, (event, data) => {
            evalConnectionsStatus();
        }, 'ConnectionsStatusChanged');

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

        evalConnectionsStatus();
    }
    
    controller.$inject = ['$scope', 
                        '$location', 
                        'redirectService', 
                        'notifyService',
                        'sharedDataService',
                        'licenseService',
                        'licenseNotifierService',
                        'connectionsStatus',
                        'connectionsManager'];

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
