(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        monitoringService,
        toastService) {

        function updateUI() {
            $scope.endpoints = {};

            monitoringService.getEndpoints().subscribe(function (endpoint) {
                if ($scope.endpoints.hasOwnProperty(endpoint.Name)) {
                    updateEndpointData($scope.endpoints[endpoint.Name], endpoint);
                } else {
                    if (!endpoint.IsFromSC) {
                        $scope.endpoints[endpoint.Name] = endpoint;
                    }
                }
            });
        }

        function updateEndpointData(scopeEndpoint, newData) {
            Object.keys(newData).forEach(function (key) {
                scopeEndpoint[key] = newData[key];
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