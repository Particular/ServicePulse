(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $timeout,
        monitoringService) {

        var timeoutId;

        $scope.$on('$destroy', function () {
            $timeout.cancel(timeoutId);
        });

        function updateUI() {
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
        '$timeout',
        'monitoringService'
    ];

    angular.module('monitored-endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));