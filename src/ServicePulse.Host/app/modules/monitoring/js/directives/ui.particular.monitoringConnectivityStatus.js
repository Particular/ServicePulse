
; (function (window, angular, $, undefined) {
    'use strict';


    function controller($scope, connectivityNotifier) {
        connectivityNotifier.getConnectionStatusSource().subscribe(value => {
            $scope.isSCMonitoringConnected = value;
        });
    }
    
    controller.$inject = ['$scope', 'connectivityNotifier'];

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

