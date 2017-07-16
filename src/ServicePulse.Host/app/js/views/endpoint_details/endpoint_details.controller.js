﻿(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $routeParams,
        toastService,
        monitoringService) {

        var subscription;

        $scope.endpointName = $routeParams.endpointName;
        $scope.loading = true;

        monitoringService.endpointDetails($routeParams.endpointName, $routeParams.sourceIndex).subscribe(function (endpointInstances) {
            $scope.endpointInstances = endpointInstances;
            $scope.loading = false;
        });

        $scope.$on("$destroy", function handler() {
            subscription.dispose();
        });
    }

    controller.$inject = [
        '$scope',
        '$routeParams',
        'toastService',
        'monitoringService',
    ];

    angular.module('endpoint_details')
        .controller('endpointDetailsCtrl', controller);

}(window, window.angular));