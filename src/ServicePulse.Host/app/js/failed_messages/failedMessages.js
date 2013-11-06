'use strict';

angular.module('failedMessages', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/failedMessages', { templateUrl: 'js/failed_messages/failedMessages.tpl.html', controller: 'FailedMessagesCtrl' });
    }])
    .controller('FailedMessagesCtrl', ['$scope', 'serviceControlService', 'streamService', '$routeParams', function ($scope, serviceControlService, streamService, $routeParams) {

        $scope.model = { total: 0, failedMessages: [], failedMessagesStats: [], selectedIds:[] };
        $scope.loadingData = false;
        $scope.disableLoadingData = false;
        
        var page = 1;
        
        function load(sortKey, page) {
            serviceControlService.getFailedMessages(sortKey, page).then(function (response) {

                $scope.loadingData = false;
                
                $scope.model.failedMessages = $scope.model.failedMessages.concat(response.data);
                $scope.model.total = response.total;
                
                if ($scope.model.failedMessages.length >= $scope.model.total) {
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
        
        $scope.toggleRowSelect = function (row) {
            
            if (row.retried) {
                return;
            }
            
            row.selected = !row.selected;
            
            if (row.selected) {
                $scope.model.selectedIds.push(row.id);
            } else {
                $scope.model.selectedIds.splice($scope.model.selectedIds.indexOf(row.id), 1);
            }
        };
        
        $scope.retryAll = function() {
            serviceControlService.retryAllFailedMessages();
        };

        $scope.retrySelected = function () {
            serviceControlService.retrySelectedFailedMessages($scope.model.selectedIds);

            $scope.model.selectedIds = [];
            
            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                if ($scope.model.failedMessages[i].selected) {
                    $scope.model.failedMessages[i].selected = false;
                    $scope.model.failedMessages[i].retried = true;
                }
            }
        };

        streamService.subscribe($scope, 'MessageFailed', function() {
            $scope.model.total++;
        });
        
        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'MessageFailed');
        });
    }]);