'use strict';

/* Controllers */

angular.module('sc.controllers', [])
    .controller('heartbeatsStats', ['$scope', 'streamService', 'serviceControlService', function($scope, streamService, serviceControlService) {

        $scope.model = { active_endpoints: 0, failing_endpoints: 0 };

        serviceControlService.getHeartbeatStats().then(function(stat) {
            $scope.model.active_endpoints = stat.active_endpoints;
            $scope.model.failing_endpoints = stat.failing_endpoints;
        });

        streamService.subscribe($scope, 'EndpointExceededGracePeriodForHeartbeats', function (_) {
            $scope.model.failing_endpoints++;
            ;
        });

        streamService.subscribe($scope, 'EndpointHeartbeatRestored', function (_) {
            $scope.model.failing_endpoints--;
        });

        streamService.subscribe($scope, 'HeartbeatingEndpointDetected', function (_) {
            $scope.model.active_endpoints++;
        });

    }])
    .controller('heartbeats', ['$scope', 'serviceControlService', 'streamService', function($scope, serviceControlService, streamService) {

        $scope.model = [];
        
        serviceControlService.getHeartbeatsList().then(function(heartbeats) {
            $scope.model = heartbeats;
        });

        streamService.subscribe($scope, 'EndpointExceededGracePeriodForHeartbeats', function (message) {
            processMessage(message, false, message.last_heartbeat_received_at);
        });

        streamService.subscribe($scope, 'EndpointHeartbeatRestored', function (message) {
            processMessage(message, true,message.restored_at);
        });

        streamService.subscribe($scope, 'HeartbeatingEndpointDetected', function (message) {
            processMessage(message, true, message.heartbeat_sent_at);
        });

        function processMessage(message, active, occured_at) {
            var idx = findHeartbeat(message.endpoint, message.machine);

            if (idx == -1) {
                $scope.model.push(angular.extend({ active: active }, message));
            } else {
                $scope.model[idx].active = active;
                $scope.model[idx].last_sent_at = occured_at;
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