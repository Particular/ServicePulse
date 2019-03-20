
; (function (window, angular, $, undefined) {
    'use strict';


    function controller($scope, connectivityNotifier, monitoringService, $interval, connectionsFactory) {
        $scope.isSCMonitoringConnecting = true;
        $scope.monitoringUrl = connectionsFactory.getMonitoringUrl();
        connectivityNotifier.getConnectionStatusSource().subscribe(value => {
            $scope.isSCMonitoringConnected = value;
            $scope.isSCMonitoringConnecting = false;
        });

        var scMonitoringConnectionPing = $interval(function () {
            var promise = monitoringService.getMonitoredEndpoints().then(r => {
                connectivityNotifier.reportSuccessfulConnection();
            }, e => {
                connectivityNotifier.reportFailedConnection();
            });
        }, 10000);

        // Cancel interval on page changes
        $scope.$on('$destroy', function () {
            if (angular.isDefined(scMonitoringConnectionPing)) {
                $interval.cancel(scMonitoringConnectionPing);
                scMonitoringConnectionPing = undefined;
            }
        });
    }

    

    

    controller.$inject = ['$scope', 'connectivityNotifier', 'monitoringService', '$interval', 'connectionsFactory'];

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

