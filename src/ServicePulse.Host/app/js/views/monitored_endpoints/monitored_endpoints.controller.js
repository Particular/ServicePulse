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

                    $scope.endpoints.sort(function (first, second) {
                        if (first.name < second.name) {
                            return -1;
                        }

                        if (first.name > second.name) {
                            return 1;
                        }

                        return 0;
                    });
                }

                $scope.$apply();
            });

            endpointsFromScSubscription =
                Rx.Observable.interval(monitoringService.calculateIntervalInMiliseconds($scope.selectedPeriod.value))
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