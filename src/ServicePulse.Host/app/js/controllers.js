'use strict';

/* Controllers */

angular.module('sc.controllers', [])
    .controller('heartbeatsStats', ['$scope', 'streamService', 'serviceControlService', function($scope, streamService, serviceControlService) {

        $scope.model = { active_endpoints: 0, failing_endpoints: 0 };

        serviceControlService.getHeartbeatStats().then(function(stat) {
            $scope.model.active_endpoints = stat.active_endpoints;
            $scope.model.failing_endpoints = stat.failing_endpoints;
        });

        streamService.subscribe($scope, 'EndpointFailedToHeartbeat', function (_) {
            $scope.model.failing_endpoints++;
            $scope.model.active_endpoints--;
        });

        streamService.subscribe($scope, 'EndpointRestored', function (_) {
            $scope.model.failing_endpoints--;
            $scope.model.active_endpoints++;
        });

        streamService.subscribe($scope, 'EndpointDetected', function (_) {
            $scope.model.active_endpoints++;
        });

    }])
    .controller('heartbeats', ['$scope', 'serviceControlService', 'streamService', function($scope, serviceControlService, streamService) {

        $scope.model = [];
        
        serviceControlService.getHeartbeatsList().then(function(heartbeats) {
            $scope.model = heartbeats;
        });

        streamService.subscribe($scope, 'EndpointFailedToHeartbeat', function (message) {
            processMessage(message, false, message.last_received_at);
        });

        streamService.subscribe($scope, 'EndpointRestored', function (message) {
            processMessage(message, true, message.at);
        });

        streamService.subscribe($scope, 'EndpointDetected', function (message) {
            processMessage(message, true, message.at);
        });

        function processMessage(message, active, lastUpdatedAt) {
            var idx = findHeartbeat(message.endpoint, message.machine);

            if (idx == -1) {
                $scope.model.push(angular.extend({ active: active, last_sent_at: lastUpdatedAt }, message));
            } else {
                $scope.model[idx].active = active;
                $scope.model[idx].last_sent_at = lastUpdatedAt;
            }
        }

        function findHeartbeat(endpoint, machine) {
            for (var i = 0; i < $scope.model.length; i++) {
                if ($scope.model[i].endpoint === endpoint && $scope.model[i].machine === machine) {
                    return i;
                }
            }

            return -1;
        };
    }]);