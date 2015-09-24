; (function (window, angular, undefined) {

    'use strict';

    angular.module('eventLogItems', [])
        .controller('EventLogItemsCtrl', ['$scope', 'serviceControlService', 'streamService', function ($scope, serviceControlService, streamService) {

            $scope.model = [];
            $scope.loadingData = true;

            serviceControlService.getEventLogItems().then(function (eventLogItems) {
                $scope.model = eventLogItems;
                $scope.loadingData = false;
            });

            var cleanupMethod = streamService.subscribe('EventLogItemAdded', function (message) {
                processMessage(message);
            });

            $scope.$on('$destroy', function () {
                cleanupMethod();
            });

            function processMessage(message) {
                $scope.model.push(angular.extend(message));
            }
        }]);

} (window, window.angular));