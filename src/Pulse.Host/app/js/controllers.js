'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('MyCtrl1', ['$scope', 'streamService', function ($scope, streamService) {

        $scope.pings = [];
        $scope.callSignalR = function() {
            streamService.send('ServiceBus.Management.Infrastructure.SignalR.Ping, ServiceBus.Management', { title: 'John' });
        };
        streamService.subscribe($scope, 'ping', function (message) {
            $scope.$apply(function(scope) {
                scope.pings.push(message);
            });
        });
        
  }])
  .controller('MyCtrl2', [function() {

  }]);