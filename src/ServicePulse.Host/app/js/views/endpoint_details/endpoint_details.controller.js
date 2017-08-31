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
        $scope.showInstancesBreakdown = true;

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

            subscription = monitoringService.createEndpointDetailsSource($routeParams.endpointName, $routeParams.sourceIndex, $scope.selectedPeriod.value).subscribe(function (endpoint) {
                if (endpoint.error) {
                    toastService.showWarning('Could not load endpoint details');
                } else {
                    $scope.endpoint = endpoint;
                    $scope.loading = false;
                }

                $scope.throughput = endpointInstances[0].throughput;
                $scope.throughput.xAxisPoints = [
                                '2017-08-30 11:00', '2017-08-30 11:05', '2017-08-30 11:10', '2017-08-30 11:15',
                                '2017-08-30 11:20', '2017-08-30 11:25', '2017-08-30 11:30',
                                '2017-08-30 11:35', '2017-08-30 11:40', '2017-08-30 11:45', 
                                '2017-08-30 11:50', '2017-08-30 11:55', '2017-08-30 12:00', '2017-08-30 12:05',
                                '2017-08-30 12:10', '2017-08-30 12:15', '2017-08-30 12:20',
                                '2017-08-30 12:25', '2017-08-30 12:35', '2017-08-30 12:40', 
                ];
               
               
                $scope.endpoint.instances.forEach(function (instance) {
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