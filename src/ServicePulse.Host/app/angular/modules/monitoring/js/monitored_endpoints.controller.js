(function(window, angular, Rx) {
    'use strict';

    function controller(
        $scope,
        $location,
        monitoringService,
        serviceControlService,
        historyPeriodsService,
        $filter,
        smallGraphsMinimumYAxis,
        connectivityNotifier,
        connectionsManager,
        endpointGrouping
        ) {

        var subscription, endpointsFromScSubscription;

        $scope.periods = historyPeriodsService.getAllPeriods();
        $scope.selectedPeriod = historyPeriodsService.getDefaultPeriod();
        $scope.smallGraphsMinimumYAxis = smallGraphsMinimumYAxis;
        $scope.endpoints = [];
        $scope.filter = { name: $location.search().filter };
        $scope.order = { prop: "name", expression: "-name" };
        $scope.loading = true;
        $scope.location = $location;
        $scope.monitoringUrl = connectionsManager.getMonitoringUrl();
        $scope.hasData = false; // TODO: UI toggles between 'no connectivity' and 'no data' but unknown how to set this via the monitoringService rx observable.
        $scope.grouping = {
            groupedEndpoints: [],
            groupSegments: 0,
            selectedGrouping: 0,
            selectGroup: selectGroup
        }

        function selectGroup(groupSize) {
            $scope.grouping.selectedGrouping = groupSize;
            $scope.grouping.groupedEndpoints = endpointGrouping.group($scope.endpoints, groupSize);
        }

        $scope.$watchCollection("endpoints", function () {
            $scope.grouping.groupSegments = endpointGrouping.findSegments($scope.endpoints);
            $scope.grouping.groupedEndpoints = endpointGrouping.group($scope.endpoints, $scope.grouping.selectedGrouping);
        });

        $scope.$watch("filter.name",
            function(newVal) {
                $location.search('filter', newVal);
            });

        $scope.selectPeriod = function(period) {
            $scope.selectedPeriod = period;
            historyPeriodsService.saveSelectedPeriod(period);
            updateUI();
        };

        $scope.getDetailsUrl = endpoint => {
            return '#/monitoring/endpoint/' + endpoint.name + '?historyPeriod=' + $scope.selectedPeriod.value;
        };

        $scope.totalThroughput = () => {
            return Math.round($scope.endpoints.reduce((total, currentEndpoint) => total + currentEndpoint.metrics.throughput.average, 0));
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
                if (Object.prototype.hasOwnProperty.call(source, propName)) {
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
                .subscribe(function (endpoint) {

                    $scope.loading = false;
                    $scope.hasData = !endpoint.empty;
                    $scope.supportsEndpointCount = Object.prototype.hasOwnProperty.call(endpoint, 'connectedCount');

                    if (endpoint.empty) {
                        return;
                    }

                    if (endpoint.error) {
                        connectivityNotifier.reportFailedConnection();
                        if ($scope.endpoints) {
                            $scope.endpoints.forEach((item) => item.isScMonitoringDisconnected = true);
                        }
                    } else {
                        connectivityNotifier.reportSuccessfulConnection();
                        var index = $scope.endpoints.findIndex(function (item) { return item.name === endpoint.name; });

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
    }

    controller.$inject = [
        '$scope',
        '$location',
        'monitoringService',
        'serviceControlService',
        'historyPeriodsService',
        '$filter',
        'smallGraphsMinimumYAxis',
        'connectivityNotifier',
        'connectionsManager',
        'endpointGrouping'
    ];

    angular.module('monitored_endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular, window.Rx));
