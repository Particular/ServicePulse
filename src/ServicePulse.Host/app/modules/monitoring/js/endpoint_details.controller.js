﻿(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $routeParams,
        $location,
        toastService,
        serviceControlService,
        monitoringService,
        historyPeriods,
        $filter,
        smallGraphsMinimumYAxis,
        largeGraphsMinimumYAxis
    ) {

        $scope.endpointName = $routeParams.endpointName;
        $scope.sourceIndex = $routeParams.sourceIndex;
        $scope.loading = true;
        $scope.showInstancesBreakdown = false;
        $scope.largeGraphsMinimumYAxis = largeGraphsMinimumYAxis;
        $scope.smallGraphsMinimumYAxis = smallGraphsMinimumYAxis;

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

            var selectedPeriod = $scope.selectedPeriod;

            subscription = monitoringService.createEndpointDetailsSource($routeParams.endpointName, $routeParams.sourceIndex, selectedPeriod.value, selectedPeriod.refreshInterval).subscribe(function (endpoint) {
                if (endpoint.error) {
                    toastService.showWarning('Could not load endpoint details', false);
                    if ($scope.endpoint && $scope.endpoint.instances) {
                        $scope.endpoint.instances.forEach((item) => item.isScMonitoringDisconnected = true);
                    }

                    if ($scope.endpoint && $scope.endpoint.messageTypes) {
                        $scope.endpoint.messageTypes.forEach((messageType) => messageType.isScMonitoringDisconnected = true);
                    }
                    
                } else {
                    $scope.endpoint = endpoint;

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
                    $scope.endpoint.messageTypes.forEach((messageType) => fillDisplayValues(messageType));

                    $scope.endpoint.isStale = true;

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
        'historyPeriods',
        '$filter',
        'smallGraphsMinimumYAxis',
        'largeGraphsMinimumYAxis'
    ];

    angular.module('endpoint_details')
        .controller('endpointDetailsCtrl', controller);

}(window, window.angular));