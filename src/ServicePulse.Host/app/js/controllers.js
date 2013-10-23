'use strict';


/* Controllers */

angular.module('sc.controllers', ['ngGrid'])
    
    .controller('alerts', ['$scope', 'serviceControlService', 'streamService', function($scope, serviceControlService, streamService) {

        $scope.model = [];

        serviceControlService.getAlerts().then(function (alerts) {
            $scope.model = alerts;
        });

        streamService.subscribe($scope, 'AlertRaised', function (message) {
            processMessage(message);
        });

        function processMessage(message) {
            $scope.model.push(angular.extend(message));
        };
    }])
     .controller('customChecks', ['$scope', 'serviceControlService', 'streamService', function ($scope, serviceControlService, streamService) {

         $scope.model = { number_of_failed_checks: 0, failedChecks: [] };

         //TODO: Need to read the list of failed checks from database
         //serviceControlService.getFailedChecks().then(function (failedChecks) {
         //    $scope.model.failedChecks = failedChecks;
         //    $scope.model.number_of_failed_checks = failedChecks.length;
         //});

         streamService.subscribe($scope, 'CustomCheckFailed', function () {
             $scope.model.number_of_failed_checks++;
         });

         streamService.subscribe($scope, 'CustomCheckSucceeded', function () {
             $scope.model.number_of_failed_checks--;
         });

     }]);