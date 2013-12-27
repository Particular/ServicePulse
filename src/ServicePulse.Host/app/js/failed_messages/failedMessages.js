'use strict';

angular.module('failedMessages', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/failedMessages', { templateUrl: 'js/failed_messages/failedMessages.tpl.html', controller: 'FailedMessagesCtrl' });
    }])
    .controller('FailedMessagesCtrl', ['$scope', '$window', 'serviceControlService', 'streamService', '$routeParams', 'scConfig', function ($scope, $window, serviceControlService, streamService, $routeParams, scConfig) {

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

        $scope.toggleStacktrace = function (row) {
            row.showStacktrace = !row.showStacktrace;
            return false;
        };

        $scope.loadMoreResults = function () {
            load(); 
        };
        
        $scope.toggleRowSelect = function (row) {
            
            if (row.retried || row.archived) {
                return;
            }
            
            row.selected = !row.selected;
            
            if (row.selected) {
                $scope.model.selectedIds.push(row.id);
            } else {
                $scope.model.selectedIds.splice($scope.model.selectedIds.indexOf(row.id), 1);
            }
        };

        $scope.getId = function (row) {        
            return row.message_id;
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
            serviceControlService.retryFailedMessages($scope.model.selectedIds);

            $scope.model.selectedIds = [];
            
            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                if ($scope.model.failedMessages[i].selected) {
                    $scope.model.failedMessages[i].selected = false;
                    $scope.model.failedMessages[i].retried = true;
                }
            }
        };
        
        $scope.archiveSelected = function () {
            serviceControlService.archiveFailedMessages($scope.model.selectedIds);

            $scope.model.selectedIds = [];

            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                if ($scope.model.failedMessages[i].selected) {
                    $scope.model.failedMessages[i].selected = false;
                    $scope.model.failedMessages[i].archived = true;
                }
            }
        };

        $scope.debugInServiceInsight = function (index) {
            var messageId = $scope.model.failedMessages[index].message_id;
            var dnsName = scConfig.service_control_url.toLowerCase();
            var isSecure = false;

            if (dnsName.indexOf("https") == 0) {
                isSecure = true;
                dnsName = dnsName.replace("https://", "");
            } else {
                dnsName = dnsName.replace("http://", "");
            }

            $window.open("si://" + dnsName + "?secure=" + isSecure + "&search=" + messageId);
        };

        streamService.subscribe($scope, 'MessageFailed', function (event) {

            var failedMessageId = event.failed_message_id;

            $scope.model.total++;

            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                var existingFailure = $scope.model.failedMessages[i];
                if (failedMessageId == existingFailure.id && existingFailure.retried) {
                    existingFailure.retried = false;
                    return;
                }
                
            }

            $scope.model.newMessages++;
        });
        
        streamService.subscribe($scope, 'MessageFailureResolved', function (event) {

            var failedMessageId = event.failed_message_id;

            $scope.model.total--;

            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                var existingFailure = $scope.model.failedMessages[i];
                if (failedMessageId == existingFailure.id) {
                    //remove the item
                    $scope.model.failedMessages.splice(i, 1);
                    return;
                }

            }

            $scope.model.newMessages--;
        });
        
        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'MessageFailed');
            streamService.unsubscribe($scope, 'MessageFailureResolved');
        });
    }]);