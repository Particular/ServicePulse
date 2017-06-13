(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        monitoringService) {

        function updateUI() {
            $scope.endpoints = {};

            monitoringService.getEndpoints().subscribe(function (endpoint) {
                $scope.endpoints[endpoint.endpointName] = endpoint;
            monitoringService.getData().then(function (data) {
                $scope.endpoints = data["NServiceBus.Endpoints"];
                $scope.endpoints.forEach(function(item) {
                    for (var key in item.Data) {
                        var average = item.Data[key].reduce(function (sum, a) { return sum + a }, 0) / (item.Data[key].length || 1);
                        item.Data[key + "Avg"] = average;
                    }
                })
                timeoutId = $timeout(function () {
                    updateUI();
                }, 5000);
            });
        }

        function loadEndpointData() {
             
        }

        updateUI();
    };

    controller.$inject = [
        '$scope',
        'monitoringService'
    ];

    angular.module('monitored-endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));