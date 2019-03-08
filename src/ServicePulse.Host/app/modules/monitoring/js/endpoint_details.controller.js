﻿(function(window, angular, undefined) {
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
        $scope.sourceIndex = $routeParams.sourceIndex;
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

        function mergeIn(destination, source, propertiesToSkip) {
            for (var propName in source) {
                if (source.hasOwnProperty(propName)) {
                    if(!propertiesToSkip || !propertiesToSkip.includes(propName)) {
                        destination[propName] = source[propName];
                    }
                }
            }
        }

        $scope.buildUrl = function (selectedPeriodValue, showInstacesBreakdown, breakdownPageNo) {

            var breakdownTabName = showInstacesBreakdown ? 'instancesBreakdown' : 'messageTypeBreakdown';

            return `#/monitoring/endpoint/${$scope.endpointName}/${$scope.sourceIndex}?historyPeriod=${selectedPeriodValue}&tab=${breakdownTabName}&pageNo=${breakdownPageNo}`;
        };

        $scope.updateUrl = function () {

            var updatedUrl = $scope.buildUrl($scope.selectedPeriod.value, $scope.showInstancesBreakdown, $scope.endpoint.messageTypesPage);

            $window.location.hash = updatedUrl;
        };

        $scope.showInstancesBreakdownTab = function(isVisible) {
            $scope.showInstancesBreakdown = isVisible;

            $scope.endpoint.refreshMessageTypes();
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
        };

        function updateUI() {
            if (subscription) {
                subscription.dispose();
            }

            var selectedPeriod = $scope.selectedPeriod;

            subscription = monitoringService.createEndpointDetailsSource($routeParams.endpointName, $routeParams.sourceIndex, selectedPeriod.value, selectedPeriod.refreshInterval).subscribe(function (endpoint) {

                $scope.loading = false;

                if (endpoint.error) {
                    connectivityNotifier.reportFailedConnection($routeParams.sourceIndex);
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

                    processMessageTypes();

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
