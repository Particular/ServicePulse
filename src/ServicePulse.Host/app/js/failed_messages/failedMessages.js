'use strict';

angular.module('failedMessages', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/failedMessages', { templateUrl: 'js/failed_messages/failedMessages.tpl.html', controller: 'FailedMessagesCtrl' });
    }])
    .controller('FailedMessagesCtrl', ['$scope', 'serviceControlService', 'streamService', '$routeParams', function ($scope, serviceControlService, streamService, $routeParams) {

        $scope.model = { total: 0, failedMessages: [], failedMessagesStats: [], selectedIds:[], newMessages: 0 };
        $scope.loadingData = false;
        $scope.disableLoadingData = false;
        
        var page = 1;

        function init() {
            page = 1;
            $scope.model.failedMessages = [];
            $scope.model.selectedIds = [];
            $scope.disableLoadingData = false;
        }
        
        function load() {
            if ($scope.loadingData) {
                return;
            }

            $scope.loadingData = true;
            
            serviceControlService.getFailedMessages($routeParams.sort, page).then(function (response) {
                $scope.model.failedMessages = $scope.model.failedMessages.concat(response.data);
                $scope.model.total = response.total;

                if ($scope.model.failedMessages.length >= $scope.model.total) {
                    $scope.disableLoadingData = true;
                }
                
                $scope.loadingData = false;
                page++;
            });
            
            serviceControlService.getFailedMessageStats().then(function (failedMessagesStats) {
                $scope.model.failedMessagesStats = failedMessagesStats;
            });
        };

        $scope.loadMoreResults = function () {
            
            load(); 
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
        
        $scope.refreshResults = function () {
            init();
            load();
            $scope.model.newMessages = 0;
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

        streamService.subscribe($scope, 'MessageFailed', function () {
            $scope.model.newMessages++;
        });
        
        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'MessageFailed');
        });
    }]);