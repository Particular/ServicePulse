(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        monitoringService,
        serviceControlService,
        toastService) {

        var subscription;

        function updateUI() {
            $scope.endpoints = [];
            $scope.historyPeriods = function () {
                var periods = {
                    items: [
                        { value: 5, text: "Last 5 min." },
                        { value: 10, text: "Last 10 min." },
                        { value: 15, text: "Last 15 min." },
                        { value: 30, text: "Last 30 min." },
                        { value: 60, text: "Last hour" }
                    ]
                }

                periods.selected = periods.items[0];
                periods.select = function (item) {
                    periods.selected = item;
                    monitoringService.changeHistoryPeriod(item.value);
                }

                return periods;
            }();

            subscription = monitoringService.endpoints.subscribe(function (endpoint) {
                var index = $scope.endpoints.findIndex(function (item) { return item.name === endpoint.name });
                if (index >= 0) {
                    $scope.endpoints[index] = endpoint;
                } else {
                    $scope.endpoints.push(endpoint);
                }

                serviceControlService.getExceptionGroupsForLogicalEndpoint(endpoint.name).then(function (result) {
                    $scope.endpoints[index].errorCount = result.data[0].count;
                }, function (err) {
                    // Warn user
                });
            });
        };

        updateUI();

        $scope.$on("$destroy", function handler() {
            subscription.dispose();
        });
    };

    controller.$inject = [
        '$scope',
        'monitoringService',
        'serviceControlService',
        'toastService'
    ];

    angular.module('monitored_endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));