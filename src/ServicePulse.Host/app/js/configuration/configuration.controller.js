(function () {
    'use strict';

    function ConfigurationCtrl($scope, serviceControlService) {

        $scope.model = { endpoints: [], changes: {} };

        $scope.update = function (id) {
            var newState = $scope.model.changes[id];

            serviceControlService.updateEndpoint(id, { "monitor_heartbeat": newState });
        };

        serviceControlService.getEndpoints()
            .then(function (response) {
                $scope.model.endpoints = response;
            });
    };

    ConfigurationCtrl.$inject = ['$scope', 'serviceControlService'];

    angular.module('configuration')
        .controller('ConfigurationCtrl', ConfigurationCtrl);

    

   

})();

