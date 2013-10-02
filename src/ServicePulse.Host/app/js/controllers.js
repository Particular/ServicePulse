'use strict';


/* Controllers */

angular.module('sc.controllers', ['ngGrid'])
    
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

     .controller('customChecks', ['$scope', 'serviceControlService', 'streamService', function ($scope, serviceControlService, streamService) {

         $scope.model = { number_of_failed_checks: 0, failedChecks: [] };

         //TODO: Need to read the list of failed checks from database
         //serviceControlService.getFailedChecks().then(function (failedChecks) {
         //    $scope.model.failedChecks = failedChecks;
         //    $scope.model.number_of_failed_checks = failedChecks.length;
         //});

         streamService.subscribe($scope, 'CustomCheckFailed', function (message) {
             $scope.model.number_of_failed_checks++;
         });

         streamService.subscribe($scope, 'CustomCheckSucceeded', function (message) {
             $scope.model.number_of_failed_checks--;
         });

     }])

        .controller('failedMessages', ['$scope', 'serviceControlService', 'streamService', function ($scope, serviceControlService, streamService) {

            $scope.model = { number_of_failed_messages: 0, failedMessages: [], failedMessagesStats:[], tags:[], selectedTags: [], selectedMessages: [], selectedIds: [] };

            serviceControlService.getFailedMessages().then(function (failedMessages) {
                $scope.model.failedMessages = failedMessages;
                $scope.model.number_of_failed_messages = failedMessages.length;
            });
            
            $scope.gridOptions = {
                data: 'model.failedMessages',
                showGroupPanel: true,
                enableRowSelection: true,
                showSelectionCheckbox: true,
                columnDefs:
                [
                    { field: 'receiving_endpoint.machine', displayName: 'Machine', enableCellEdit: false },
                    { field: 'receiving_endpoint.name', displayName: 'Name', enableCellEdit: false },
                    { field: 'message_type', displayName: 'Message Type', enableCellEdit: false },
                    { field: 'time_sent', displayName: 'Timestamp', enableCellEdit: false },
                    { field: 'failure_details.exception.exception_type', displayName: 'Exception Type', enableCellEdit: false },
                    { field: 'failure_details.exception.message', displayName: 'Failure Reason', enableCellEdit: false }
                ],
                selectedItems: $scope.model.selectedMessages
            };

            serviceControlService.getFailedMessageStats().then(function (failedMessagesStats) {
                $scope.model.failedMessagesStats = failedMessagesStats;
                
                // populate the tags -- loop through each category
                for (var i = 0; i < $scope.model.failedMessagesStats['machines'].values.length; i++) {
                    var tagObj = { id: 'machines', label: $scope.model.failedMessagesStats['machines'].values[i].range };
                    $scope.model.tags.push(tagObj);
                }
                for (var i = 0; i < $scope.model.failedMessagesStats['endpoints'].values.length; i++) {
                    var tagObj = { id: 'endpoints', label: $scope.model.failedMessagesStats['endpoints'].values[i].range };
                    $scope.model.tags.push(tagObj);
                }
                
                for (var i = 0; i < $scope.model.failedMessagesStats['message types'].values.length; i++) {
                    var tagObj = { id: 'message types', label: $scope.model.failedMessagesStats['message types'].values[i].range };
                    $scope.model.tags.push(tagObj);
                }
            });


            $scope.retryAll = function() {
                serviceControlService.retryAllFailedMessages();
            };
            
            $scope.retrySelected = function () {
                for (var i = 0; i < $scope.model.selectedMessages.length; i++) {
                    $scope.model.selectedIds.push($scope.model.selectedMessages[i].id);
                }
                serviceControlService.retrySelectedFailedMessages($scope.model.selectedIds);
            };

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