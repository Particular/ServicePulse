(function(window, angular, undefined) {
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
            monitoringService.getRaw().then(function (data) {
                $scope.endpoints = data["NServiceBus.Endpoints"];

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
        .controller('monitoredEndpointsCtrl', controller);

}(window, window.angular));