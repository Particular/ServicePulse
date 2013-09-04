'use strict';

/* Controllers */

angular.module('sc.controllers', [])
    .controller('heartbeatsStats', ['$scope', 'streamService', 'serviceControlService', function ($scope, streamService, serviceControlService) {

        $scope.model = {active_endpoints: '?', number_of_failing_endpoints: '?'};
        
        serviceControlService.getHeartbeatStats().then(function (stat) {
            $scope.model.active_endpoints = stat.active_endpoints;
            $scope.model.number_of_failing_endpoints = stat.number_of_failing_endpoints;
        });

        streamService.subscribe($scope, 'HeartbeatSummaryChanged', function (message) {
            $scope.model.active_endpoints = message.active_endpoints;
            $scope.model.number_of_failing_endpoints = message.number_of_failing_endpoints;
        });
        
  }])
  .controller('heartbeats', ['$scope', 'serviceControlService', 'streamService', function ($scope, serviceControlService, streamService) {

      $scope.model = [];

      function refresh() {
          serviceControlService.getHeartbeatsList().then(function(heartbeats) {
              $scope.model = heartbeats;
          });
      }

      refresh();

      streamService.subscribe($scope, 'HeartbeatSummaryChanged', function (_) {
          refresh();
      });
  }]);