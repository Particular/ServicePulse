(function(window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $routeParams,
        toastService,
        monitoringService) {

        $scope.endpointName = $routeParams.endpointName;
        $scope.loading = true;

        monitoringService.loadEndpointDetails($scope.endpointName, $routeParams.sourceIndex).then(function (result) {
        }, function (err) {
            // show warning
            toastService.showWarning('Could not load endpoint details');
        }).then(function () {
            $scope.loading = false;
    });
    };

    controller.$inject = [
        '$scope',
        '$routeParams',
        'toastService',
        'monitoringService',
    ];

    angular.module('endpoint_details')
        .controller('endpointDetailsCtrl', controller);

}(window, window.angular));