(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $location,
        monitoringService,
        serviceControlService,
        toastService,
        historyPeriods,
        rx,
        $filter,
        smallGraphsMinimumYAxis,
        connectivityNotifier) {

        var subscription, endpointsFromScSubscription;

        $scope.periods = historyPeriods;
        $scope.selectedPeriod = $scope.periods[0];
        $scope.smallGraphsMinimumYAxis = smallGraphsMinimumYAxis;

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

        $scope.getDetailsUrl = endpoint => {
            if (!endpoint.isServiceControlOnly) {
                return '#/endpoint_details/' + endpoint.name + '/' + endpoint.sourceIndex + '?historyPeriod=' + $scope.selectedPeriod.value;
            }

            return '#/failed-messages/groups/' + endpoint.serviceControlId;
        };

        function fillDisplayValuesForEndpoint(endpoint) {

            $filter('graphduration')(endpoint.metrics.processingTime);
            $filter('graphduration')(endpoint.metrics.criticalTime);
            $filter('graphdecimal')(endpoint.metrics.queueLength, 0);
            $filter('graphdecimal')(endpoint.metrics.throughput, 2);
            $filter('graphdecimal')(endpoint.metrics.retries, 2);
        }

        function updateUI() {
            if (subscription) {
                subscription.dispose();
            }

            if (endpointsFromScSubscription) {
                endpointsFromScSubscription.dispose();
            }

            var selectedPeriod = $scope.selectedPeriod;

            subscription = monitoringService.createEndpointsSource(selectedPeriod.value, selectedPeriod.refreshInterval).subscribe(function (endpoint) {
                if (endpoint.error) {
                    connectivityNotifier.reportFailedConnection();
                    if ($scope.endpoints) {
                        $scope.endpoints.filter((item) => item.sourceIndex === endpoint.sourceIndex)
                            .forEach((item) => item.isScMonitoringDisconnected = true);
                    
                } else {
                    connectivityNotifier.reportSuccessfulConnection();
                    var index = $scope.endpoints.findIndex(function(item) { return item.name === endpoint.name });

                    endpoint.isConnected = true;
                    fillDisplayValuesForEndpoint(endpoint);
                    if (index >= 0) {
                        var previousServiceControlId = $scope.endpoints[index].serviceControlId;
	                    var previousErrorCount = $scope.endpoints[index].errorCount;

	                    $scope.endpoints[index] = endpoint;
	                    $scope.endpoints[index].serviceControlId = previousServiceControlId;
	                    $scope.endpoints[index].errorCount = previousErrorCount;
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
                    var index = $scope.endpoints.findIndex(function(item) { return item.name === endpoint.title });
                    if (index >= 0) {
                        $scope.endpoints[index].serviceControlId = endpoint.id;
                        $scope.endpoints[index].errorCount = endpoint.count;
                    } else {
                        $scope.endpoints.push({ name: endpoint.title, errorCount: endpoint.count, isConnected: false, isServiceControlOnly: true, serviceControlId: endpoint.id });
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
        'historyPeriods',
        'rx',
        '$filter',
        'smallGraphsMinimumYAxis',
        'connectivityNotifier'
    ];

    angular.module('monitored_endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));