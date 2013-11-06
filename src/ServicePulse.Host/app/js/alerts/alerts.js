'use strict';

angular.module('alerts', [])
    .controller('AlertsCtrl', ['$scope', 'serviceControlService', 'streamService', function($scope, serviceControlService, streamService) {

        $scope.model = [];
        $scope.loadingData = true;
        
        serviceControlService.getAlerts().then(function(alerts) {
            $scope.model = alerts;
            $scope.loadingData = false;
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