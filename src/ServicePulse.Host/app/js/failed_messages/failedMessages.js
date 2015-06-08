'use strict';

angular.module('failedMessages', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/failedMessages', { templateUrl: 'js/failed_messages/failedMessages.tpl.html', controller: 'FailedMessagesCtrl' });
    }])
    .controller('FailedMessagesCtrl', ['$scope', '$window', 'serviceControlService', 'streamService', '$routeParams', 'scConfig', 'notifications',
        function ($scope, $window, serviceControlService, streamService, $routeParams, scConfig, notifications) {
        var scVersionSupportingExceptionGroups = '1.6.0';
        var page = 1;
        $scope.allFailedMessagesGroup = { 'id': undefined, 'title': 'All failed messages', 'count': 0 };
        
        $scope.model = { exceptionGroups: [], failedMessages: [], failedMessagesStats: [], selectedIds: [], newMessages: 0 };
        $scope.loadingData = false;
        $scope.disableLoadingData = false;
        $scope.selectedExceptionGroup = $scope.allFailedMessagesGroup;
        
        function cmpVersion(a, b) {
            var i, cmp, len, re = /(\.0)+[^\.]*$/;
            a = (a + '').replace(re, '').split('.');
            b = (b + '').replace(re, '').split('.');
            len = Math.min(a.length, b.length);
            for (i = 0; i < len; i++) {
                cmp = parseInt(a[i], 10) - parseInt(b[i], 10);
                if (cmp !== 0) {
                    return cmp;
                }
            }
            return a.length - b.length;
        }

        function gteVersion(a, b) {
            return cmpVersion(a, b) >= 0;
        }
        
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
            
            serviceControlService.getVersion().then(function (sc_version) {
                if (gteVersion(sc_version, scVersionSupportingExceptionGroups)) {
                    serviceControlService.getExceptionGroups().then(function (response) {
                        $scope.model.exceptionGroups = response.data;
                    });
                } else {
                    notifications.pushForCurrentRoute('You are using Service Control version ' + sc_version +
                        '. Please, upgrade to version ' + scVersionSupportingExceptionGroups + ' or higher to access full functionality of Service Pulse.', 'error');
                }
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

        $scope.loadMoreResults = function (group, isFirstPage, sort) {
            if (isFirstPage) {
                $scope.model.failedMessages = [];
                $scope.selectedExceptionGroup = group;
                page = 1;
                $scope.disableLoadingData = false;
            }
            
            if ($scope.model.failedMessages.length >= group.count) {
                $scope.disableLoadingData = true;
            }

            if ($scope.disableLoadingData || $scope.loadingData) {
                return;
            }
            
            $scope.loadingData = true;

            if (group && group.id) {
                serviceControlService.getFailedMessagesForExceptionGroup(group.id, sort || $routeParams.sort, page).then(function (response) {
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
            $scope.allFailedMessagesGroup.count++;

            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                var existingFailure = $scope.model.failedMessages[i];
                if (failedMessageId == existingFailure.id && existingFailure.retried) {
                    existingFailure.retried = false;
                    return;
                }
            }

            var prevText = 'Refresh page to see ' + $scope.model.newMessages + ' new failed messages';
            var prevNotifications = notifications.getCurrent().filter(function (not) {
                return not.message === prevText;
            });
            prevNotifications.forEach(function(notification) {
                notifications.remove(notification);
            });
            $scope.model.newMessages++;
            notifications.pushForCurrentRoute('Refresh page to see ' + $scope.model.newMessages + ' new failed messages', 'info');
        });
        
        streamService.subscribe($scope, 'MessageFailureResolved', function (event) {
            var failedMessageId = event.failed_message_id;
            $scope.allFailedMessagesGroup.count--;

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
            

        streamService.subscribe($scope, 'NewFailedMessagesGroupCreated', function (event) {
            var text = 'New failure group detected: \'' + event.id + '\'. Reload the page to see it.';
            if (notifications.getCurrent().filter(function (not) { return not.message === text; }).length === 0) {
                notifications.pushForCurrentRoute(text, 'info');
            }
        });
        
        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'MessageFailed');
            streamService.unsubscribe($scope, 'MessageFailureResolved');
            streamService.unsubscribe($scope, 'NewFailedMessagesGroupCreated');
        });

        $scope.refreshResults();
    }]);