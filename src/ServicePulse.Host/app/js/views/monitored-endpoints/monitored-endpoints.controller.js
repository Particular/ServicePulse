(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        monitoringService,
        toastService) {

        function updateUI() {
            $scope.endpoints = {};

            monitoringService.getEndpoints().subscribe(function (data) {
                $scope.endpoints = data["NServiceBus.Endpoints"];
                $scope.endpoints.forEach(function(item) {
                    for (var key in item.Data) {
                        var average = item.Data[key].reduce(function(sum, a) { return sum + a }, 0) /
                            (item.Data[key].length || 1);
                        item.Data[key + "Avg"] = average;
                    }
                });
            }, function (err) {
                toastService.showWarning('Failed to load endpoints from monitoring service');
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