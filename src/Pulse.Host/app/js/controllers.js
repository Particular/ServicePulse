'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('MyCtrl1', ['$scope', 'streamService', function ($scope, streamService) {

        $scope.pings = [];
        $scope.callSignalR = function() {
            streamService.send('Ping', { name: 'John' });
        };
        streamService.subscribe($scope, 'Pong', function (message) {
            $scope.$apply(function(scope) {
                scope.pings.push(message);
            });
        });
        
        
  }])
  .controller('MyCtrl2', ['$scope', 'serviceControlService', function($scope, serviceControlService) {
      serviceControlService.getEndpointsWithSla().then(function(endpoints) {
          $scope.endpoints = endpoints;
      });
  }]);