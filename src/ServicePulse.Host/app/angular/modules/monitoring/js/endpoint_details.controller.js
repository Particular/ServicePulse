(function(window, angular) {
    'use strict';

    function controller(
        $scope,
        $routeParams,
        $location,
        $window,
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
        $scope.showInstancesBreakdown = $routeParams.tab === 'instancesBreakdown';
        $scope.loading = true;
        $scope.loadedSuccessfully = false;
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

        monitoringService.isRemovingEndpointEnabled().then(enabled => {
            $scope.isRemovingEndpointEnabled = enabled;
        });

        function mergeIn(destination, source, propertiesToSkip) {
            for (var propName in source) {
                if (Object.prototype.hasOwnProperty.call(source, propName)) {
                    if(!propertiesToSkip || !propertiesToSkip.includes(propName)) {
                        destination[propName] = source[propName];
                    }
                }
            }
        }

        $scope.buildUrl = function (selectedPeriodValue, showInstacesBreakdown, breakdownPageNo) {

            var breakdownTabName = showInstacesBreakdown ? 'instancesBreakdown' : 'messageTypeBreakdown';

            return `#/monitoring/endpoint/${$scope.endpointName}?historyPeriod=${selectedPeriodValue}&tab=${breakdownTabName}&pageNo=${breakdownPageNo}`;
        };

        $scope.updateUrl = function () {

            var updatedUrl = $scope.buildUrl($scope.selectedPeriod.value, $scope.showInstancesBreakdown, $scope.endpoint.messageTypesPage);

            $window.location.hash = updatedUrl;
        };

        $scope.showInstancesBreakdownTab = function(isVisible) {
            $scope.showInstancesBreakdown = isVisible;

            $scope.endpoint.refreshMessageTypes();
        };

        $scope.removeEndpoint = (endpointName, instance) => {
            instance.busy = true;
            monitoringService.removeEndpointInstance(endpointName, instance.id).then(() => {
                $scope.endpoint.instances.splice($scope.endpoint.instances.indexOf(instance), 1);

                if ($scope.endpoint.instances.length === 0) {
                    $window.location.hash = '#/monitoring';
                }
            }, () => {
                instance.busy = false;
            });
        };

        $scope.endpoint = {
            messageTypesPage: !$scope.showInstancesBreakdown ? $routeParams.pageNo : 1,
            messageTypesTotalItems: 0,
            messageTypesItemsPerPage: 10,
            messageTypesAvailable: false,
            messageTypesUpdatedSet: [],
            refreshMessageTypes: function () {
                if ($scope.endpoint.messageTypesAvailable) {
                    $scope.endpoint.messageTypesAvailable = false;

                    $scope.endpoint.messageTypes = $scope.endpoint.messageTypesUpdatedSet;
                    $scope.endpoint.messageTypesUpdatedSet = null;

                    processMessageTypes();
                }
            }
        };

        function processMessageTypes() {

            $scope.endpoint.messageTypesTotalItems = $scope.endpoint.messageTypes.length;

            $scope.endpoint.messageTypes.forEach((messageType) => {
                fillDisplayValues(messageType);
                messageTypeParser.parseTheMessageTypeData(messageType);
            });
        }

        function updateUI() {
            if (subscription) {
                subscription.dispose();
            }

            var selectedPeriod = $scope.selectedPeriod;

            subscription = monitoringService.createEndpointDetailsSource($routeParams.endpointName, selectedPeriod.value, selectedPeriod.refreshInterval).subscribe(function (endpoint) {

                $scope.loading = false;

                if (endpoint.error) {
                    connectivityNotifier.reportFailedConnection();
                    if ($scope.endpoint && $scope.endpoint.instances) {
                        $scope.endpoint.instances.forEach((item) => item.isScMonitoringDisconnected = true);
                    }

                    $scope.endpoint.isScMonitoringDisconnected = true;

                } else {

                    if ($scope.endpoint.messageTypesTotalItems > 0 &&
                        $scope.endpoint.messageTypesTotalItems !== endpoint.messageTypes.length) {

                        mergeIn($scope.endpoint, endpoint, ['messageTypes']);

                        $scope.endpoint.messageTypesAvailable = true;
                        $scope.endpoint.messageTypesUpdatedSet = endpoint.messageTypes;

                    } else {
                        mergeIn($scope.endpoint, endpoint);
                    }

                    connectivityNotifier.reportSuccessfulConnection();

                    $scope.endpoint.instances.sort(function (first, second) {
                        if (first.id < second.id) {
                            return -1;
                        }

                        if (first.id > second.id) {
                            return 1;
                        }

                        return 0;
                    });

                    processMessageTypes();

                    $scope.endpoint.isStale = true;
                    $scope.endpoint.isScMonitoringDisconnected = false;
                    $scope.negativeCriticalTimeIsPresent = false;

                    $scope.endpoint.instances.forEach(function (instance) {
                        fillDisplayValues(instance);
                        serviceControlService.getExceptionGroupsForEndpointInstance(instance.id).then(function (result) {
                            if (result.data.length > 0) {
                                instance.serviceControlId = result.data[0].id;
                                instance.errorCount = result.data[0].count;
                                instance.isScMonitoringDisconnected = false;
                            }
                        }, function (err) {
                            // Warn user?
                    });
                        $scope.endpoint.isStale = $scope.endpoint.isStale && instance.isStale;
                        $scope.negativeCriticalTimeIsPresent |= instance.metrics.criticalTime.displayValue.value < 0;
                    });

                    $scope.loadedSuccessfully = true;
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
        '$window',
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
