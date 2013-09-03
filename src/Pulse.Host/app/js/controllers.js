'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('MyCtrl1', ['$scope', 'streamService', 'serviceControlService', function ($scope, streamService, serviceControlService) {

        $scope.model = {active_endpoints: '?', number_of_failing_endpoints: '?'};
        
        serviceControlService.getHeartbeatStats().then(function (stat) {
            $scope.model.active_endpoints = stat.active_endpoints;
            $scope.model.number_of_failing_endpoints = stat.number_of_failing_endpoints;
        });

        streamService.subscribe($scope, 'HeartbeatSummaryChanged', function (message) {
            $scope.$apply(function (scope) {
                scope.model.active_endpoints = message.active_endpoints;
                scope.model.number_of_failing_endpoints = message.number_of_failing_endpoints;
            });
        });
        
  }])
  .controller('MyCtrl2', ['$scope', 'serviceControlService', function($scope, serviceControlService) {
      serviceControlService.getEndpointsWithSla().then(function(endpoints) {
          $scope.endpoints = endpoints;
      });
  }]);