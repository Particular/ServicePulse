'use strict';

angular.module('failedMessages', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/failedMessages', { templateUrl: 'js/failed_messages/failedMessages.tpl.html', controller: 'FailedMessagesCtrl' });
    }])
    .controller('FailedMessagesCtrl', ['$scope', 'serviceControlService', 'streamService', '$routeParams', function ($scope, serviceControlService, streamService, $routeParams) {

        $scope.model = { total_number_of_failed_messages: 0, failedMessages: [], failedMessagesStats: [] };
        $scope.loadingData = false;
        $scope.disableLoadingData = false;
        
        var page = 1;
        
        function load(sortKey, page) {
            serviceControlService.getFailedMessages(sortKey, page).then(function (response) {

                $scope.loadingData = false;
                
                $scope.model.failedMessages = $scope.model.failedMessages.concat(response.data);
                $scope.model.total_number_of_failed_messages = response.total;
                
                if ($scope.model.failedMessages.length >= $scope.model.total_number_of_failed_messages) {
                    $scope.disableLoadingData = true;
                }
            });
            
            serviceControlService.getFailedMessageStats().then(function (failedMessagesStats) {
                $scope.model.failedMessagesStats = failedMessagesStats;
            });
        };

        $scope.loadMoreResults = function () {
            if ($scope.loadingData) {
                return;
            }
            
            $scope.loadingData = true;
            load($routeParams.sort, page++); 
        };
        
        $scope.retryAll = function() {
            serviceControlService.retryAllFailedMessages();
        };

        $scope.retrySelected = function () {
            var selectedIds = [];

            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                if ($scope.model.failedMessages[i].selected) {
                    selectedIds.push($scope.model.failedMessages[i].id);
                }
            }
            serviceControlService.retrySelectedFailedMessages(selectedIds);
        };

        streamService.subscribe($scope, 'MessageFailed', function() {
            $scope.model.total_number_of_failed_messages++;
        });
        
        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'MessageFailed');
        });
    }]);