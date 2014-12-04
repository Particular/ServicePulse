'use strict';

angular.module('scaleout', [])
    .config([
        '$routeProvider', function($routeProvider) {
            $routeProvider.when('/scaleout', { templateUrl: 'js/scaleout/scaleout.tpl.html', controller: 'ScaleOutCtrl' });
        }
    ])
    .controller('ScaleOutCtrl', [
        '$scope', 'serviceControlService', function($scope, serviceControlService) {

            $scope.model = { };

            serviceControlService.getScaleoutGroups()
                .then(function (response) {
                    $scope.model.groups = response;
                });

        $scope.$watch("model.group", function(newValue) {
            if (newValue) {
                serviceControlService.getScaleoutGroup(newValue.name)
                    .then(function (response) {
                        $scope.model.enlistments = response;
                    });
            }
        });
    }
    ]);