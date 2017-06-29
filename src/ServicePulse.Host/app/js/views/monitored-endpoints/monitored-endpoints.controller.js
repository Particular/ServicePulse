(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        monitoringService,
        toastService) {

        var subscription;

        function updateUI() {
            $scope.endpoints = [];

            subscription = monitoringService.endpoints.subscribe(function (endpoint) {
                var index = $scope.endpoints.findIndex(function (item) { return item.Name === endpoint.Name });
                if (index >= 0) {
                    $scope.endpoints[index] = endpoint;
                } else {
                    $scope.endpoints.push(endpoint);
                }
            });
        }

        updateUI();

        $scope.$on("$destroy", function handler() {
            subscription.dispose();
        });
    };

    controller.$inject = [
        '$scope',
        'monitoringService',
        'toastService'
    ];

    angular.module('monitored-endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));