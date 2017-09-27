(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $routeParams,
        $location,
        toastService,
        serviceControlService,
        monitoringService,
        historyPeriods,
        formatter) {

        $scope.endpointName = $routeParams.endpointName;
        $scope.sourceIndex = $routeParams.sourceIndex;
        $scope.loading = true;
        $scope.showInstancesBreakdown = false;

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
                
                $scope.endpoint.metricDetails.metrics.throughput.timeAxisValues = $scope.endpoint.metricDetails.metrics.throughput.timeAxisValues.map(function(item) {
                    var date = new Date(item);
                    return date.toLocaleTimeString();
                });
                endpoint.metricDetails.metrics.throughput.className = 'throughput';
                endpoint.metricDetails.metrics.throughput.unit = 'msgs/s';
                endpoint.metricDetails.metrics.throughput.axisName = 'Throughput [' + endpoint.metricDetails.metrics.throughput.unit + ']';
                endpoint.metricDetails.metrics.queueLength.className = 'queue-length';
                endpoint.metricDetails.metrics.queueLength.unit = 'msgs';
                endpoint.metricDetails.metrics.queueLength.axisName = 'Queue Length [' + endpoint.metricDetails.metrics.queueLength.unit + ']';
               
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
        'historyPeriods',
        'formatter'
    ];

    angular.module('endpoint_details')
        .controller('endpointDetailsCtrl', controller);

}(window, window.angular));