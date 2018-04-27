(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $location,
        monitoringService,
        serviceControlService,
        toastService,
        historyPeriodsService,
        rx,
        $filter,
        smallGraphsMinimumYAxis,
        connectivityNotifier) {

        var subscription, endpointsFromScSubscription;

        $scope.periods = historyPeriodsService.getAllPeriods();
        $scope.selectedPeriod = historyPeriodsService.getDefaultPeriod();
        $scope.smallGraphsMinimumYAxis = smallGraphsMinimumYAxis;
        $scope.endpoints = [];

        $scope.selectPeriod = function (period) {
            $scope.selectedPeriod = period;
            historyPeriodsService.saveSelectedPeriod(period);
            updateUI();
        };

        $scope.getDetailsUrl = endpoint => {
            return '#/endpoint_details/' + endpoint.name + '/' + (endpoint.sourceIndex | 0) + '?historyPeriod=' + $scope.selectedPeriod.value;
        };

        function fillDisplayValuesForEndpoint(endpoint) {

            $filter('graphduration')(endpoint.metrics.processingTime);
            $filter('graphduration')(endpoint.metrics.criticalTime);
            $filter('graphdecimal')(endpoint.metrics.queueLength, 0);
            $filter('graphdecimal')(endpoint.metrics.throughput, 2);
            $filter('graphdecimal')(endpoint.metrics.retries, 2);
        }

        function mergeIn(destination, source) {
            for (var propName in source) {
                if (source.hasOwnProperty(propName)) {
                    destination[propName] = source[propName];
                }
            }
        }

        function updateUI() {
            if (subscription) {
                subscription.dispose();
            }

            if (endpointsFromScSubscription) {
                endpointsFromScSubscription.dispose();
            }

            var selectedPeriod = $scope.selectedPeriod;

            subscription = monitoringService.createEndpointsSource(selectedPeriod.value, selectedPeriod.refreshInterval)
                .subscribe(function(endpoint) {
                    if (endpoint.error) {
                        connectivityNotifier.reportFailedConnection(endpoint.sourceIndex);
                        if ($scope.endpoints) {
                            $scope.endpoints.filter((item) => item.sourceIndex === endpoint.sourceIndex)
                                .forEach((item) => item.isScMonitoringDisconnected = true);
                        }
                    } else {
                        connectivityNotifier.reportSuccessfulConnection(endpoint.sourceIndex);
                        var index = $scope.endpoints.findIndex(function(item) { return item.name === endpoint.name });

                        endpoint.isScMonitoringDisconnected = false;
                        fillDisplayValuesForEndpoint(endpoint);
                        if (index >= 0) {
                          mergeIn($scope.endpoints[index], endpoint);
                        } else {
                            $scope.endpoints.push(endpoint);

                            $scope.endpoints.sort(function(first, second) {
                                if (first.name < second.name) {
                                    return -1;
                                }

                                if (first.name > second.name) {
                                    return 1;
                                }

                                return 0;
                            });
                        }
                    }

                    $scope.$apply();
                });

            endpointsFromScSubscription =
                Rx.Observable.interval(5000).startWith(0)
                .flatMap(function(i) {
                    return Rx.Observable.fromPromise(serviceControlService.getExceptionGroups('Endpoint Name', ''));
                }).selectMany(function(endpoints) {
                    return endpoints.data;
                }).subscribe(function (endpoint) {
                    if (endpoint.operation_status === 'ArchiveCompleted') {
                        return;
                    }
                    var index = $scope.endpoints.findIndex(function(item) { return item.name === endpoint.title });
                    if (index >= 0) {
                        $scope.endpoints[index].serviceControlId = endpoint.id;
                        $scope.endpoints[index].errorCount = endpoint.count;
                    } else {
                        $scope.endpoints.push({ name: endpoint.title, errorCount: endpoint.count, serviceControlId: endpoint.id, isScMonitoringDisconnected : true });
                    }
                });
        }

        updateUI();

        $scope.$on("$destroy", function handler() {
            subscription.dispose();
            endpointsFromScSubscription.dispose();
        });
    };

    controller.$inject = [
        '$scope',
        '$location',
        'monitoringService',
        'serviceControlService',
        'toastService',
        'historyPeriodsService',
        'rx',
        '$filter',
        'smallGraphsMinimumYAxis',
        'connectivityNotifier'
    ];

    angular.module('monitored_endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));