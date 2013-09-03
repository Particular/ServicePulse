'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('MyCtrl1', ['$scope', 'streamService', function ($scope, streamService) {

        $scope.model = {success: 0, fail: 0};
        
        streamService.subscribe($scope, 'HeartbeatSummary', function (message) {
            $scope.$apply(function (scope) {
                scope.model.success = message.active_endpoints;
                scope.model.fail = message.number_of_failing_endpoints;
            });
        });
        
  }])
  .controller('MyCtrl2', ['$scope', 'serviceControlService', function($scope, serviceControlService) {
      serviceControlService.getEndpointsWithSla().then(function(endpoints) {
          $scope.endpoints = endpoints;
      });
  }]);