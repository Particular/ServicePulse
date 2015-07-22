'use strict';

angular.module('failedMessages', [])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/failedMessages', { templateUrl: 'js/failed_messages/failedMessages.tpl.html', controller: 'FailedMessagesCtrl' });
    }])
    .controller('FailedMessagesCtrl', ['$scope', '$window', '$timeout', 'serviceControlService', 'streamService', '$routeParams', 'scConfig', 'notifications',
        function ($scope, $window, $timeout, serviceControlService, streamService, $routeParams, scConfig, notifications) {
            $scope.allFailedMessagesGroup = { 'id': undefined, 'title': 'All failed messages', 'count': 0 };
            $scope.selectedExceptionGroup = $scope.allFailedMessagesGroup;
            $scope.model = { exceptionGroups: [], failedMessages: [], selectedIds: [], newMessages: 0, activePageTab:"" };
            $scope.loadingData = false;
            $scope.allMessagesLoaded = false;
            var scVersionSupportingExceptionGroups = '1.6.0';
            var page = 1;

            var isSupportedInServiceControl = function(currentScVersion, minVersion) {
                var i, cmp, len, re = /(\.0)+[^\.]*$/;
                currentScVersion = (currentScVersion + '').replace(re, '').split('.');
                minVersion = (minVersion + '').replace(re, '').split('.');
                len = Math.min(currentScVersion.length, minVersion.length);
                for (i = 0; i < len; i++) {
                    cmp = parseInt(currentScVersion[i], 10) - parseInt(minVersion[i], 10);
                    if (cmp !== 0) {
                        return cmp;
                    }
                }
                return currentScVersion.length - minVersion.length >= 0;
            };

            var processLoadedMessages = function (data) {
                $scope.model.failedMessages = $scope.model.failedMessages.concat(data);
                $scope.allMessagesLoaded = ($scope.model.failedMessages.length >= $scope.selectedExceptionGroup.count);
                $scope.loadingData = false;
                page++;
            };

            $scope.init = function () {
                page = 1;
                $scope.model.failedMessages = [];
                $scope.model.exceptionGroups = [];
                $scope.model.selectedIds = [];
                $scope.allMessagesLoaded = false;
                $scope.model.newMessages = 0;
                $scope.model.activePageTab = "messages";

                if ($scope.loadingData) {
                    return;
                }

                $scope.loadingData = true;

                serviceControlService.getVersion()
                    .then(function (sc_version) {
                        if (isSupportedInServiceControl(sc_version, scVersionSupportingExceptionGroups)) {
                            serviceControlService.getExceptionGroups()
                                .then(function (response) {
                                    $scope.model.exceptionGroups = response.data;
                                })
                                .then(function () {
                                    if ($scope.model.exceptionGroups.length > 0) {
                                        $scope.model.activePageTab = "groups";
                                    }
                                })
                            ;
                        } else {
                            var SCneedsUpgradeMessage = 'You are using Service Control version ' + sc_version + '. Please, upgrade to version ' + scVersionSupportingExceptionGroups + ' or higher to access full functionality of Service Pulse.';
                            notifications.pushForCurrentRoute(SCneedsUpgradeMessage, 'error');
                        }
                    });

                serviceControlService.getFailedMessages($routeParams.sort, page).then(function (response) {
                    $scope.allFailedMessagesGroup.count = response.total;
                    processLoadedMessages(response.data);
                });
            };

            $scope.togglePanel = function (row, panelnum) {
                if (row.messageBody === undefined) {
                    serviceControlService.getMessageBody(row.message_id).then(function (message) {
                        row.messageBody = message.data;
                    }, function () {
                        row.bodyUnavailable = "message body unavailable";
                    });
                }

                if (row.messageHeaders === undefined) {
                    serviceControlService.getMessageHeaders(row.message_id).then(function (message) {
                        row.messageHeaders = message.data[0].headers;
                    }, function () {
                        row.headersUnavailable = "message headers unavailable";
                    });
                }
                row.panel = panelnum;
                return false;
            };

            $scope.selectGroup = function (group, sort) {
                if ($scope.loadingData)
                    return;
                $scope.model.activePageTab = "messages";
                $scope.model.failedMessages = [];
                $scope.selectedExceptionGroup = group;
                $scope.allMessagesLoaded = false;
                page = 1;

                $scope.loadMoreResults(group, sort);
            };

            $scope.loadMoreResults = function (group, sort) {
                $scope.allMessagesLoaded = $scope.model.failedMessages.length >= group.count;

                if ($scope.allMessagesLoaded || $scope.loadingData) {
                    return;
                }

                $scope.loadingData = true;

                var allExceptionsGroupSelected = (!group || !group.id);
                if (allExceptionsGroupSelected) {
                    serviceControlService.getFailedMessages($routeParams.sort, page).then(function (response) {
                        processLoadedMessages(response.data);
                    });
                } else {
                    serviceControlService.getFailedMessagesForExceptionGroup(group.id, sort || $routeParams.sort, page).then(function (response) {
                        processLoadedMessages(response.data);
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

            $scope.retryAll = function () {
                serviceControlService.retryAllFailedMessages();
                $scope.init();
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

                $scope.init();
            };

//            $scope.retryExceptionGroup = function (group) {
//                serviceControlService.retryExceptionGroup(group.id, group.count);
//
//                for (var i = 0; i < $scope.model.failedMessages.length; i++) {
//                    $scope.model.failedMessages[i].retried = true;
//                }
//
//                $scope.init();
//            };

            var removeGroup = function (group) {
                //remove group
                for (var j = 0; j < $scope.model.exceptionGroups.length; j++) {
                    var exGroup = $scope.model.exceptionGroups[j];
                    if (group.title === exGroup.title) {
                        $scope.model.exceptionGroups.splice(j, 1);
                    }
                }
            }

            var markMessage = function (group, property) {
                //mark messages as retried
                if ($scope.selectedExceptionGroup && group.id === $scope.selectedExceptionGroup.id) {
                    for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                        $scope.model.failedMessages[i][property] = true;
                    }
                }
            }

            var selectAllFailedMessagesGroup = function () {
                // move focus
                $scope.selectGroup($scope.allFailedMessagesGroup);
            }

            $scope.retryExceptionGroup = function($event, group) {
                $event.stopPropagation();
               
                var notificationText = 'Retrying messages from group ' + group.title;
                serviceControlService.retryExceptionGroup(group.id, notificationText);

                removeGroup(group);
                markMessage(group, 'retried');
                selectAllFailedMessagesGroup();
            }

           

            $scope.archiveExceptionGroup = function ($event, group) {
                $event.stopPropagation();
                var notificationText = 'Archiving messages from group ' + group.title;
                serviceControlService.archiveExceptionGroup(group.id, notificationText);

                removeGroup(group);
                markMessage(group, 'archived');
                selectAllFailedMessagesGroup();
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

            var updateCountForFailedMessageNotification = function (previousCount, newCount) {
                var notificationText = ' new failed messages. Refresh the page to see them.';
                notifications.removeByText(previousCount + notificationText);
                notifications.pushForCurrentRoute(newCount + notificationText, 'error');

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
                
                updateCountForFailedMessageNotification($scope.model.newMessages, ++$scope.model.newMessages);
            });

            streamService.subscribe($scope, 'MessageFailureResolved', function (event) {
                var failedMessageId = event.failed_message_id;
                $scope.allFailedMessagesGroup.count--;

                for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                    var existingFailure = $scope.model.failedMessages[i];
                    if (failedMessageId == existingFailure.id) {
                        $scope.model.failedMessages.splice(i, 1);
                        return;
                    }
                }

                $scope.model.newMessages--;
            });

            streamService.subscribe($scope, 'NewFailureGroupDetected', function (event) {
                var text = 'New failure group detected: \'' + event.group_name + '\'. Refresh the page to see it.';
                notifications.pushForCurrentRoute(text, 'error');
            });

            streamService.subscribe($scope, 'FailedMessageGroupArchived', function () {
                notifications.pushForCurrentRoute('Messages from group \'' + group.title + '\' were successfully archived.', 'info');
            });

            $scope.$on('$destroy', function () {
                streamService.unsubscribe($scope, 'MessageFailed');
                streamService.unsubscribe($scope, 'MessageFailureResolved');
                streamService.unsubscribe($scope, 'NewFailureGroupDetected');
                streamService.unsubscribe($scope, 'FailedMessageGroupArchived');
            });

            $scope.init();
        }]);