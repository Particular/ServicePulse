'use strict';

angular.module('alerts', ['ngGrid'])
    .controller('AlertsCtrl', ['$scope', 'serviceControlService', 'streamService', function($scope, serviceControlService, streamService) {

        $scope.model = [];

        serviceControlService.getAlerts().then(function(alerts) {
            $scope.model = alerts;
        });

        streamService.subscribe($scope, 'AlertRaised', function(message) {
            processMessage(message);
        });

        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'AlertRaised');
        });
        
        function processMessage(message) {
            $scope.model.push(angular.extend(message));
        }
    }]);