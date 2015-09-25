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

            var subscriptionDisposalMethod = streamService.subscribe('EventLogItemAdded', function (message) {
                processMessage(message);
            });

            $scope.$on('$destroy', function () {
                subscriptionDisposalMethod();
            });

            function processMessage(message) {
                $scope.model.push(angular.extend(message));
            }
        }]);

} (window, window.angular));