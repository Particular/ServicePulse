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

        streamService.subscribe($scope, 'EndpointHeartbeatRestored', function (_) {
            $scope.model.failing_endpoints--;
            $scope.model.active_endpoints++;
        });

        streamService.subscribe($scope, 'HeartbeatingEndpointDetected', function (_) {
            $scope.model.active_endpoints++;
        });

    }])

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

        .controller('failedMessages', ['$scope', 'serviceControlService', 'streamService', function ($scope, serviceControlService, streamService) {

            $scope.model = { number_of_failed_messages: 0, failedMessages: [] };

            serviceControlService.getFailedMessages().then(function (failedMessages) {
                $scope.model.failedMessages = failedMessages;
                $scope.model.number_of_failed_messages = failedMessages.length;
            });

            streamService.subscribe($scope, 'MessageFailed', function (message) {
                processMessage(message);
            });

            function processMessage(message) {
                //$scope.model.errors.push(angular.extend(message));
                $scope.model.number_of_failed_messages++;
            };
        }])
    .controller('heartbeats', ['$scope', 'serviceControlService', 'streamService', function($scope, serviceControlService, streamService) {

        $scope.model = [];
        
        serviceControlService.getHeartbeatsList().then(function(heartbeats) {
            $scope.model = heartbeats;
        });

        streamService.subscribe($scope, 'EndpointFailedToHeartbeat', function (message) {
            processMessage(message, false, message.lastReceivedAt);
        });

        streamService.subscribe($scope, 'EndpointHeartbeatRestored', function (message) {
            processMessage(message, true, message.restoredAt);
        });

        streamService.subscribe($scope, 'HeartbeatingEndpointDetected', function (message) {
            processMessage(message, true, message.detectedAt);
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