'use strict';

angular.module('failedMessages', ['ngGrid'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/failedMessages', { templateUrl: 'js/failed_messages/failedMessages.tpl.html', controller: 'FailedMessagesCtrl' });
    }])
    .controller('FailedMessagesCtrl', ['$scope', 'serviceControlService', 'streamService', function($scope, serviceControlService, streamService) {

        $scope.model = { number_of_failed_messages: 0, failedMessages: [], failedMessagesStats: [], tags: [], selectedTags: [], selectedMessages: [], selectedIds: [] };

        serviceControlService.getFailedMessages().then(function(response) {
            $scope.model.failedMessages = response.data;
            $scope.model.number_of_failed_messages = response.total;            
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

        serviceControlService.getFailedMessageStats().then(function(failedMessagesStats) {
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

        $scope.retrySelected = function() {
            for (var i = 0; i < $scope.model.selectedMessages.length; i++) {
                $scope.model.selectedIds.push($scope.model.selectedMessages[i].id);
            }
            serviceControlService.retrySelectedFailedMessages($scope.model.selectedIds);
        };

        streamService.subscribe($scope, 'MessageFailed', function() {
            $scope.model.number_of_failed_messages++;
        });
        
        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'MessageFailed');
        });
    }]);