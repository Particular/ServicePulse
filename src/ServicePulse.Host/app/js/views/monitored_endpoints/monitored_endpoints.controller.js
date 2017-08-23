﻿(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $location,
        monitoringService,
        serviceControlService,
        toastService,
        historyPeriods,
        rx ) {

        var subscription, ednpointsFromScSubscription;

        $scope.periods = historyPeriods;
        $scope.selectedPeriod = $scope.periods[0];

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

        function updateUI() {
            if (subscription) {
                subscription.dispose();
            }

            if (ednpointsFromScSubscription) {
                ednpointsFromScSubscription.dispose();
            }

            subscription = monitoringService.createEndpointsSource($scope.selectedPeriod.value).subscribe(function (endpoint) {
                var index = $scope.endpoints.findIndex(function (item) { return item.name === endpoint.name });
                endpoint.isConnected = true;
                if (index >= 0) {
                    $scope.endpoints[index] = endpoint;
                } else {
                    $scope.endpoints.push(endpoint);
                    index = $scope.endpoints.length - 1;
                }

                serviceControlService.getExceptionGroupsForLogicalEndpoint(endpoint.name).then(function (result) {
                    $scope.endpoints[index].errorCount = result.data[0].count;
                }, function (err) {
                    // Warn user
                });
            });

            ednpointsFromScSubscription = createSourceFrom(function () {
                return serviceControlService.getExceptionGroupsPromise('Endpoint Name', null);
            }).subscribe(function (endpoint) {
                var index = $scope.endpoints.findIndex(function (item) { return item.name === endpoint.title });
                if (index >= 0) {
                    $scope.endpoints[index].errorCount = endpoint.count;
                } else {
                    $scope.endpoints.push({ name: endpoint.title, errorCount: endpoint.count, isConnected: false });
                }
            });
        }

        function createSourceFrom(promise) {
            return Rx.Observable.create(function (observer) {
                var interval;
                var setUp = function () {
                    clearInterval(interval);

                    loadData(observer, promise);
                    interval = setInterval(function () { loadData(observer, promise); }, 5000);
                }

                setUp();

                return function () {
                    clearInterval(interval);
                    interval = null;
                };
            }).shareReplay(1).selectMany(function (endpoints) {
                return endpoints;
            });
        }

        function loadData(observer, promise) {
            promise().then(function(result) {
                observer.onNext(result.data);
            });
        }

        updateUI();

        $scope.$on("$destroy", function handler() {
            subscription.dispose();
        });
    };

    controller.$inject = [
        '$scope',
        '$location',
        'monitoringService',
        'serviceControlService',
        'toastService',
        'historyPeriods',
        'rx'
    ];

    angular.module('monitored_endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));