
; (function (window, angular, $, undefined) {
    'use strict';


    function controller($scope, connectivityNotifier, monitoringService, $interval) {
        $scope.isSCMonitoringConnecting = true;
        connectivityNotifier.getConnectionStatusSource().subscribe(value => {
            $scope.isSCMonitoringConnected = value;
            $scope.isSCMonitoringConnecting = false;
        });

        var scMonitoringConnectionPing = $interval(function () {
            var promises = monitoringService.checkConnections().map(p => {
                p.then(r => {
                    connectivityNotifier.reportSuccessfulConnection(i);
                }, e => {
                    connectivityNotifier.reportFailedConnection(i);
                });
            });
            
            for (var i = 0; i < promises.length; i++) {
                promises[i].then(r => {
                    connectivityNotifier.reportSuccessfulConnection(i);
                }, e => {
                    connectivityNotifier.reportFailedConnection(i);
                });
            }

        }, 10000);

        // Cancel interval on page changes
        $scope.$on('$destroy', function () {
            if (angular.isDefined(scMonitoringConnectionPing)) {
                $interval.cancel(scMonitoringConnectionPing);
                scMonitoringConnectionPing = undefined;
            }
        });
    }

    

    

    controller.$inject = ['$scope', 'connectivityNotifier', 'monitoringService', '$interval'];

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

