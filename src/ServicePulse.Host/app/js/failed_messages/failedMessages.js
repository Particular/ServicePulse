'use strict';

angular.module('failedMessages', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/failedMessages', { templateUrl: 'js/failed_messages/failedMessages.tpl.html', controller: 'FailedMessagesCtrl' });
    }])
    .controller('FailedMessagesCtrl', ['$scope', 'serviceControlService', 'streamService', '$routeParams', function ($scope, serviceControlService, streamService, $routeParams) {

        $scope.model = { number_of_failed_messages: 0, failedMessages: [], failedMessagesStats: [], tags: [], selectedTags: [] };

        function load(sortKey) {
            serviceControlService.getFailedMessages(sortKey).then(function (response) {
                $scope.model.failedMessages = response.data;
                $scope.model.number_of_failed_messages = response.total;            
            });
            
            serviceControlService.getFailedMessageStats().then(function (failedMessagesStats) {
                $scope.model.failedMessagesStats = failedMessagesStats;

                $scope.model.tags = [];
                
                for (var i = 0; i < $scope.model.failedMessagesStats['machines'].values.length; i++) {
                    $scope.model.tags.push({ id: 'machines', label: $scope.model.failedMessagesStats['machines'].values[i].range });
                }

                for (var i = 0; i < $scope.model.failedMessagesStats['endpoints'].values.length; i++) {
                    $scope.model.tags.push({ id: 'endpoints', label: $scope.model.failedMessagesStats['endpoints'].values[i].range });
                }

                for (var i = 0; i < $scope.model.failedMessagesStats['message types'].values.length; i++) {
                    $scope.model.tags.push({ id: 'message types', label: $scope.model.failedMessagesStats['message types'].values[i].range });
                }
            });
        };

        load($routeParams.sort);

        $scope.retryAll = function() {
            serviceControlService.retryAllFailedMessages();
        };

        $scope.retrySelected = function () {
            serviceControlService.retrySelectedFailedMessages(getSelected());
        };

        $scope.getSelected = function() {
            var selectedIds = [];

            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                if ($scope.model.failedMessages[i].selected) {
                    selectedIds.push($scope.model.failedMessages[i].id);
                }
            }

            return selectedIds;
        };

        
        streamService.subscribe($scope, 'MessageFailed', function() {
            $scope.model.number_of_failed_messages++;
        });
        
        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'MessageFailed');
        });
    }]);