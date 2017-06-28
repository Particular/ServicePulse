(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        monitoringService,
        toastService) {

        function updateUI() {
            $scope.endpoints = [];

            monitoringService.endpoints.subscribe(function (endpoint) {
                var index = $scope.endpoints.findIndex(function (item) { return item.Name === endpoint.Name });
                if (index >= 0) {
                    $scope.endpoints[index] = endpoint;
                } else {
                    $scope.endpoints.push(endpoint);
                }
            });
        }

        updateUI();
    };

    controller.$inject = [
        '$scope',
        'monitoringService',
        'toastService'
    ];

    angular.module('monitored-endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));