(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $routeParams,
        $location,
        toastService,
        serviceControlService,
        monitoringService,
        historyPeriodsService,
        $filter,
        smallGraphsMinimumYAxis,
        largeGraphsMinimumYAxis,
        connectivityNotifier,
        messageTypeParser
    ) {

        $scope.endpointName = $routeParams.endpointName;
        $scope.sourceIndex = $routeParams.sourceIndex;
        $scope.showInstancesBreakdown = $routeParams.tab === 'instancesBreakdown'; 
        $scope.loading = true;
        $scope.largeGraphsMinimumYAxis = largeGraphsMinimumYAxis;
        $scope.smallGraphsMinimumYAxis = smallGraphsMinimumYAxis;

        var subscription;

        $scope.periods = historyPeriodsService.getAllPeriods();
        $scope.selectedPeriod = historyPeriodsService.getDefaultPeriod();

        $scope.selectPeriod = function (period) {
            $scope.selectedPeriod = period;
            historyPeriodsService.saveSelectedPeriod(period);
            updateUI();
        };

        function mergeIn(destination, source) {
            for (var propName in source) {
                if (source.hasOwnProperty(propName)) {
                    destination[propName] = source[propName];
                }
            }
        }

        $scope.buildUrl = function (selectedPeriodValue, showInstancesBreakdownTab) {
            return `#/monitoring/endpoint/${$scope.endpointName}/${$scope.sourceIndex}?historyPeriod=${selectedPeriodValue}&tab=${$scope.showInstancesBreakdown ? 'instancesBreakdown' : 'messageTypeBreakdown'}`;
        };

        $scope.showInstancesBreakdownTab = function(isVisible) {
            $scope.showInstancesBreakdown = isVisible;
        };

        function updateUI() {
            if (subscription) {
                subscription.dispose();
            }

            var selectedPeriod = $scope.selectedPeriod;

            $scope.endpoint = {};

            subscription = monitoringService.createEndpointDetailsSource($routeParams.endpointName, $routeParams.sourceIndex, selectedPeriod.value, selectedPeriod.refreshInterval).subscribe(function (endpoint) {
                if (endpoint.error) {
                    connectivityNotifier.reportFailedConnection($routeParams.sourceIndex);
                    if ($scope.endpoint && $scope.endpoint.instances) {
                        $scope.endpoint.instances.forEach((item) => item.isScMonitoringDisconnected = true);
                    }

                    $scope.endpoint.isScMonitoringDisconnected = true;

                } else {

                    mergeIn($scope.endpoint, endpoint);

                    connectivityNotifier.reportSuccessfulConnection($routeParams.sourceIndex);

                    $scope.endpoint.instances.sort(function (first, second) {
                        if (first.id < second.id) {
                            return -1;
                        }

                        if (first.id > second.id) {
                            return 1;
                        }

                        return 0;
                    });

                    $scope.loading = false;
                    $scope.endpoint.messageTypes.forEach((messageType) => {
                        fillDisplayValues(messageType);
                        messageTypeParser.parseTheMessageTypeData(messageType);
                    });

                    $scope.endpoint.isStale = true;
                    $scope.endpoint.isScMonitoringDisconnected = false;

                    $scope.endpoint.instances.forEach(function (instance) {
                        fillDisplayValues(instance);
                        serviceControlService.getExceptionGroupsForEndpointInstance(instance.id).then(function (result) {
                            if (result.data.length > 0) {
                                instance.serviceControlId = result.data[0].id;
                                instance.errorCount = result.data[0].count;
                            }
                        }, function (err) {
                            // Warn user?
                    });
                        $scope.endpoint.isStale = $scope.endpoint.isStale && instance.isStale;
                    });
                }

                serviceControlService.getExceptionGroupsForLogicalEndpoint($scope.endpointName).then(function(result) {
                    if (result.data.length > 0) {
                        $scope.endpoint.serviceControlId = result.data[0].id;
                        $scope.endpoint.errorCount = result.data[0].count;
                    }
                });
            });
        }

        function fillDisplayValues(instance) {
            $filter('graphduration')(instance.metrics.processingTime);
            $filter('graphduration')(instance.metrics.criticalTime);
            $filter('graphdecimal')(instance.metrics.throughput, 2);
            $filter('graphdecimal')(instance.metrics.retries, 2);
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
        'historyPeriodsService',
        '$filter',
        'smallGraphsMinimumYAxis',
        'largeGraphsMinimumYAxis',
        'connectivityNotifier',
        'messageTypeParser'
    ];

    angular.module('endpoint_details')
        .controller('endpointDetailsCtrl', controller);

}(window, window.angular));
