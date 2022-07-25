require("zeroclipboard");

(function (window, angular, $) {
    'use strict';

    function controller($scope,
        connectivityNotifier,
        monitoringService,
        $interval,
        connectionsManager,
        notifyService) {

            const notifier = notifyService();
            $scope.isSCMonitoringConnecting = connectionsManager.getIsMonitoringEnabled();

            if ($scope.isSCMonitoringConnecting) {
                connectivityNotifier.reportConnecting();
            }

            $scope.monitoringUrl = connectionsManager.getMonitoringUrl();
            connectivityNotifier.getConnectionStatusSource().subscribe(value => {
                $scope.isSCMonitoringConnected = value.isConnected;
                $scope.isSCMonitoringConnecting = value.isConnecting;
            });

            var lastReport = undefined;
            var scMonitoringConnectionPing = $interval(function () {
                monitoringService.getMonitoredEndpoints().then(r => {
                    if (lastReport === 'success') {
                        return;
                    }
                    connectivityNotifier.reportSuccessfulConnection();
                    lastReport = 'success';
                }, () => {
                    if (lastReport === 'failed') {
                        return;
                    }

                    connectivityNotifier.reportFailedConnection();
                    lastReport = 'failed';
                });
            }, 10000);

            // Cancel interval on page changes
            $scope.$on('$destroy', function () {
                if (angular.isDefined(scMonitoringConnectionPing)) {
                    $interval.cancel(scMonitoringConnectionPing);
                    scMonitoringConnectionPing = undefined;
                }
            });

            notifier.subscribe($scope, (event, versionInfo) => {
                $scope.monitoringVersion = versionInfo.monitoringVersion;
            }, 'monitoringversionloaded');

            notifier.subscribe($scope, (event, versionInfo) => {
                $scope.newscmonitoringversion = true;
                $scope.newscmonitoringversionlink = versionInfo.versionLink;
                $scope.newscmonitoringversionnumber = versionInfo.versionNumber;
            }, 'newmonitoringversionavailable');
    }

    controller.$inject = ['$scope',
    'connectivityNotifier',
    'monitoringService',
    '$interval',
    'connectionsManager',
    'notifyService'];

    function directive() {
        return {
            scope: {},
            restrict: 'E',
            replace: true,
            templateUrl: 'modules/monitoring/js/directives/ui.particular.monitoringConnectivityStatus.tpl.html',
            controller: controller,
            link: function (scope, element) { }
        };
    }

    directive.$inject = [];

    angular
        .module('ui.particular.monitoringConnectivityStatus', [])
        .directive('monitoringConnectivityStatus', directive);

}(window, window.angular, window.jQuery));