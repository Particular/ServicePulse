(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $routeParams,
        $location,
        toastService,
        serviceControlService,
        monitoringService,
        historyPeriods) {

        $scope.endpointName = $routeParams.endpointName;
        $scope.sourceIndex = $routeParams.sourceIndex;
        $scope.loading = true;
        var subscription;

        $scope.periods = historyPeriods;
        $scope.selectedPeriod = $scope.periods[0];

        if ($location.$$search.historyPeriod) {
            $scope.selectedPeriod = $scope.periods[$scope.periods.findIndex(function (period) {
                return period.value == $location.$$search.historyPeriod;
            })];
        }

        $scope.selectPeriod = function (period) {
            $scope.selectedPeriod = period;

            updateUI();
        };

        function updateUI() {
            if (subscription) {
                subscription.dispose();
            }

            subscription = monitoringService.createEndpointDetailsSource($routeParams.endpointName, $routeParams.sourceIndex, $scope.selectedPeriod.value).subscribe(function (endpointInstances) {
                if (endpointInstances.error) {
                    toastService.showWarning('Could not load endpoint details');
                } else {
                    $scope.endpointInstances = endpointInstances;
                    $scope.loading = false;
                }

                $scope.endpointInstances.forEach(function (instance) {
                    serviceControlService.getExceptionGroupsForEndpointInstance(instance.id).then(function (result) {
                        instance.serviceControlId = result.data[0].id;
                        instance.errorCount = result.data[0].count;
                    }, function (err) {
                        // Warn user?
                    });
                });
            });
        }

        $scope.$on("$destroy", function handler() {
            subscription.dispose();
        });

        updateUI();
    }

    controller.$inject = [
        '$scope',
        '$routeParams',
        '$location',
        'toastService',
        'serviceControlService',
        'monitoringService',
        'historyPeriods'
    ];

    angular.module('endpoint_details')
        .controller('endpointDetailsCtrl', controller);

}(window, window.angular));