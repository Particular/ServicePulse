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
        formatter) {

        var subscription, endpointsFromScSubscription;

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

        $scope.formatTime = function (value) {
            return formatter.formatTime(value);
        };

        $scope.formatDecimal = function (value) {
            return formatter.formatLargeNumber(value, 0);
        }

        function updateUI() {
            if (subscription) {
                subscription.dispose();
            }

            if (endpointsFromScSubscription) {
                endpointsFromScSubscription.dispose();
            }

            subscription = monitoringService.createEndpointsSource($scope.selectedPeriod.value).subscribe(function (endpoint) {
                var index = $scope.endpoints.findIndex(function (item) { return item.name === endpoint.name });
                endpoint.isConnected = true;
                if (index >= 0) {
                    $scope.endpoints[index] = endpoint;
                } else {
                    $scope.endpoints.push(endpoint);
                }
            });

            endpointsFromScSubscription =
                Rx.Observable.interval(5000)
                .flatMap(function(i) {
                    return Rx.Observable.fromPromise(serviceControlService.getExceptionGroups('Endpoint Name', null));
                }).selectMany(function(endpoints) {
                    return endpoints.data;
                }).subscribe(function(endpoint) {
                    var index = $scope.endpoints.findIndex(function(item) { return item.name === endpoint.title });
                    if (index >= 0) {
                        $scope.endpoints[index].errorCount = endpoint.count;
                    } else {
                        $scope.endpoints.push({ name: endpoint.title, errorCount: endpoint.count, isConnected: false });
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
        'formatter'
    ];

    angular.module('monitored_endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));