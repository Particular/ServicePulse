(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        monitoringService,
        toastService) {

        function updateUI() {
            $scope.endpoints = {};

            monitoringService.endpoints.subscribe(function (endpoint) {
                $scope.endpoints[endpoint.Name] = endpoint;
            });
        }

        updateUI();
    };

    controller.$inject = [
        '$scope',
        'monitoringService',
        'toastService'
    ];

    angular.module('monitored-endpoints')
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));