'use strict';

angular.module('configuration', [])
    .config([
        '$routeProvider', function($routeProvider) {
            $routeProvider.when('/configuration', { templateUrl: 'js/configuration/configuration.tpl.html', controller: 'ConfigurationCtrl' });
        }
    ])
    .controller('ConfigurationCtrl', [
        '$scope', 'serviceControlService', function($scope, serviceControlService) {

            $scope.model = { endpoints: [], changes: {} };

            $scope.update = function(id) {
                var newState = $scope.model.changes[id];

                serviceControlService.updateEndpoint(id, { "monitor_heartbeat": newState });
            };

            serviceControlService.getEndpoints()
                .then(function(response) {
                    $scope.model.endpoints = response;
                });
        }
    ]);