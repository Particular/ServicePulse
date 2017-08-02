(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $location,
        monitoringService,
        serviceControlService,
        toastService,
        historyPeriods) {

        var subscription;

        $scope.periods = historyPeriods;
        $scope.selectedPeriod = $scope.periods[0];

        if ($location.$$search.historyPeriod) {
            $scope.selectedPeriod = $scope.periods[$scope.periods.findIndex(function (period) {
                return period.value == $location.$$search.historyPeriod;
            })];
        }

        $scope.endpoints = [];

        $scope.selectPeriod = function (period) {
            $scope.selectedPeriod = period;

            updateUI();
        };

        function updateUI() {
            if (subscription) {
                subscription.dispose();
            }

            subscription = monitoringService.createEndpointsSource($scope.selectedPeriod.value).subscribe(function (endpoint) {
                var index = $scope.endpoints.findIndex(function (item) { return item.name === endpoint.name });
                if (index >= 0) {
                    $scope.endpoints[index] = endpoint;
                } else {
                    $scope.endpoints.push(endpoint);
                }

                serviceControlService.getExceptionGroupsForLogicalEndpoint(endpoint.name).then(function (result) {
                    $scope.endpoints[index].errorCount = result.data[0].count;
                }, function (err) {
                    // Warn user
                });
            });
        }

        updateUI();

        $scope.$on("$destroy", function handler() {
            subscription.dispose();
        });
    };

    controller.$inject = [
        '$scope',
        '$location',
        'monitoringService',
        'serviceControlService',
        'toastService',
        'historyPeriods'
    ];

    angular.module('monitored_endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));