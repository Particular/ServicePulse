'use strict';

angular.module('eventLogItems', [])
    .controller('EventLogItemsCtrl', ['$scope', 'serviceControlService', 'streamService', function($scope, serviceControlService, streamService) {

        $scope.model = [];
        $scope.loadingData = true;
        
        serviceControlService.getEventLogItems().then(function(eventLogItems) {
            $scope.model = eventLogItems;
            $scope.loadingData = false;
        });

        streamService.subscribe($scope, 'EventLogItemAdded', function (message) {
            processMessage(message);
        });

        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'EventLogItemAdded');
        });
        
        function processMessage(message) {
            $scope.model.push(angular.extend(message));
        }
    }]);