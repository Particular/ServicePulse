﻿(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $timeout,
        monitoringService) {

        var timeoutId;

        $scope.$on('$destroy', function () {
            $timeout.cancel(timeoutId);
        });

        function updateUI() {
            monitoringService.getMetrics().getData().then(function (metricsData) {

                timeoutId = $timeout(function () {
                    updateUI();
                }, 5000);
            });
        }

        updateUI();
    };

    controller.$inject = [
        '$scope',
        '$timeout',
        'monitoringService'
    ];

    angular.module('monitored-endpoints')
        .controller('MonitoredEndpointsCtrl', controller);

}(window, window.angular));