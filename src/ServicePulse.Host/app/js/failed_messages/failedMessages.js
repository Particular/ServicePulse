'use strict';

angular.module('failedMessages', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/failedMessages', { templateUrl: 'js/failed_messages/failedMessages.tpl.html', controller: 'FailedMessagesCtrl' });
    }])
    .controller('FailedMessagesCtrl', ['$scope', '$window', 'serviceControlService', 'streamService', '$routeParams', 'scConfig', function ($scope, $window, serviceControlService, streamService, $routeParams, scConfig) {
        var page = 1;
        $scope.allFailedMessagesGroup = { 'id': undefined, 'title': 'All failed messages', 'count': 0 };
        
        $scope.model = { exceptionGroups: [], failedMessages: [], failedMessagesStats: [], selectedIds: [], newMessages: 0 };
        $scope.loadingData = false;
        $scope.disableLoadingData = false;
        $scope.selectedExceptionGroup = $scope.allFailedMessagesGroup;
        
        function init() {
            page = 1;
            $scope.model.failedMessages = [];
            $scope.model.exceptionGroups = [];
            $scope.model.failedMessagesStats = [];
            $scope.model.selectedIds = [];
            $scope.disableLoadingData = false;
        }
        
        function load() {
            if ($scope.loadingData) {
                return;
            }
            
            $scope.loadingData = true;

            serviceControlService.getExceptionGroups().then(function (response) {
                $scope.model.exceptionGroups = response.data;
            });
            
            serviceControlService.getFailedMessageStats().then(function (failedMessagesStats) {
                $scope.model.failedMessagesStats = failedMessagesStats;
            });

            serviceControlService.getFailedMessages($routeParams.sort, page).then(function (response) {
                $scope.model.failedMessages = $scope.model.failedMessages.concat(response.data);
                $scope.allFailedMessagesGroup.count = response.total;

                if ($scope.model.failedMessages.length >= $scope.allFailedMessagesGroup.count) {
                    $scope.disableLoadingData = true;
                }
                
                $scope.loadingData = false;
                page++;
            });
        };

        $scope.togglePanel = function (row, panelnum) {

            if (row.messageBody === undefined) {
                serviceControlService.getMessageBody(row.message_id).then(function (message) {
                    row.messageBody = message.data;
                }, function() {
                    row.bodyUnavailable = "message body unavailable";
                });
            }

            if (row.messageHeaders === undefined) {
                serviceControlService.getMessageHeaders(row.message_id).then(function (message) {
                    row.messageHeaders = message.data[0].headers;
                }, function() {
                    row.headersUnavailable = "message headers unavailable";
                });
            }
            row.panel = panelnum;
            return false;
        };

        $scope.loadForGroup = function (group) {
            $scope.model.failedMessages = [];
            $scope.selectedExceptionGroup = group;
            page = 1;
            $scope.disableLoadingData = false;
            
            $scope.loadMoreResults(group);
        };

        $scope.loadMoreResults = function (group) {
            if ($scope.model.failedMessages.length >= group.count) {
                $scope.disableLoadingData = true;
            }

            if ($scope.disableLoadingData || $scope.loadingData) {
                return;
            }
            
            $scope.loadingData = true;

            if (group && group.id) {
                serviceControlService.getFailedMessagesForExceptionGroup(group.id, $routeParams.sort, page).then(function(response) {
                    $scope.model.failedMessages = response.data;

                    if ($scope.model.failedMessages.length >= $scope.model.total) {
                        $scope.disableLoadingData = true;
                    }

                    $scope.loadingData = false;
                    page++;
                });
            } else {
                serviceControlService.getFailedMessages($routeParams.sort, page).then(function (response) {
                    $scope.model.failedMessages = $scope.model.failedMessages.concat(response.data);
                    $scope.model.total = response.total;

                    if ($scope.model.failedMessages.length >= $scope.model.total) {
                        $scope.disableLoadingData = true;
                    }

                    $scope.loadingData = false;
                    page++;
                });
            }
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

            init();
            delete $scope.model.failedMessagesStats; 
            $scope.model.total = 0;
            $scope.model.newMessages = 0;
            $scope.refreshResults();
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
            
            $scope.refreshResults();
        };

        $scope.retryExceptionGroup = function (group) {
            serviceControlService.retryExceptionGroup(group.id, group.count);

            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                $scope.model.failedMessages[i].retried = true;
            }
            
            $scope.refreshResults();
        };

        $scope.archiveExceptionGroup = function (group) {
            serviceControlService.archiveExceptionGroup(group.id, group.count);

            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                $scope.model.failedMessages[i].archived = true;
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

            if (dnsName.indexOf("https") == 0) {
                dnsName = dnsName.replace("https://", "");
            } else {
                dnsName = dnsName.replace("http://", "");
            }

            $window.open("si://" + dnsName + "?search=" + messageId);
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
            $scope.refreshResults();

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
            $scope.refreshResults();
        });
        
        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'MessageFailed');
            streamService.unsubscribe($scope, 'MessageFailureResolved');
        });

        $scope.refreshResults();
    }]);