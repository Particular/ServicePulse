;
(function(window, angular, undefined) {

    'use strict';

    function createWorkflowState(optionalStatus, optionalMessage, optionalTotal, optionalCount) {
        return { status: optionalStatus || 'working', message: optionalMessage || 'working', total: optionalTotal || 0, count: optionalCount || 0 };
    }

    function controller(
        $scope,
        $window,
        $timeout,
        $routeParams,
        scConfig,
        notifications,
        semverService,
        serviceControlService,
        failedMessagesService,
        streamService) {

        $scope.allFailedMessagesGroup = { 'id': undefined, 'title': 'All failed messages', 'count': 0 };
        $scope.selectedExceptionGroup = $scope.allFailedMessagesGroup;
        $scope.model = { exceptionGroups: [], failedMessages: [], selectedIds: [], newMessages: 0, activePageTab: '', displayGroupsTab: false };
        $scope.loadingData = false;
        $scope.allMessagesLoaded = false;

        var scVersionSupportingExceptionGroups = '1.6.0';
        var page = 1;

        var processLoadedMessages = function(data) {
            $scope.model.failedMessages = $scope.model.failedMessages.concat(data);
            $scope.allMessagesLoaded = ($scope.model.failedMessages.length >= $scope.selectedExceptionGroup.count);
            $scope.loadingData = false;
            page++;
        };


        var autoGetExceptionGroups = function() {
            serviceControlService.getExceptionGroups()
                .then(function(response) {
                    if (response.data.length > 0) {
                        // need a map in some ui state for controlling animations
                        var exgroups = response.data.map(function(obj) {
                            var nObj = obj;
                            nObj.workflow_state = createWorkflowState('ready', '');
                            return nObj;
                        });

                        $scope.model.exceptionGroups = exgroups;

                        return;
                    }

                    $timeout(function() {
                        autoGetExceptionGroups();
                    }, 2000);
                });
        };

        var setSortButtonText = function (sort, direction) {
            $scope.model.sortButtonText = (sort === 'message_type' ? "Message Type" : "Time Sent") + " " + (direction === 'asc' ? "ASC" : "DESC");
        }

        $scope.init = function() {
            page = 1;

            $scope.model.failedMessages = [];
            $scope.model.exceptionGroups = [];
            $scope.model.selectedIds = [];
            $scope.allMessagesLoaded = false;
            $scope.model.newMessages = 0;
            $scope.model.activePageTab = "messages";
            $scope.model.sort = "time_sent";
            $scope.model.direction = "desc";

            setSortButtonText($scope.model.sort, $scope.model.direction);

            if ($scope.loadingData) {
                return;
            }

            $scope.loadingData = true;

            serviceControlService.getVersion()
                .then(function(sc_version) {
                    if (semverService.isSupported(sc_version, scVersionSupportingExceptionGroups)) {
                        $scope.model.displayGroupsTab = true;
                        $scope.model.activePageTab = "groups";
                        autoGetExceptionGroups();
                    } else {
                        var SCneedsUpgradeMessage = 'You are using Service Control version ' + sc_version + '. Please, upgrade to version ' + scVersionSupportingExceptionGroups + ' or higher to unlock new functionality in ServicePulse.';
                        notifications.pushForCurrentRoute(SCneedsUpgradeMessage, 'info');
                    }
                });

            serviceControlService.getFailedMessages($routeParams.sort, page).then(function(response) {
                $scope.allFailedMessagesGroup.count = response.total;
                processLoadedMessages(response.data);
            });
        };

        $scope.togglePanel = function(row, panelnum) {
            if (row.messageBody === undefined) {
                serviceControlService.getMessageBody(row.message_id).then(function(message) {
                    row.messageBody = message.data;
                }, function() {
                    row.bodyUnavailable = "message body unavailable";
                });
            }

            if (row.messageHeaders === undefined) {
                serviceControlService.getMessageHeaders(row.message_id).then(function(message) {
                    row.messageHeaders = message.data[0].headers;
                }, function() {
                    row.headersUnavailable = "message headers unavailable";
                });
            }
            row.panel = panelnum;
            return false;
        };

        var selectGroupInternal = function (group, sort, direction, changeToMessagesTab) {
            $scope.model.sort = sort;
            $scope.model.direction = direction;
            setSortButtonText(sort, direction);

            if ($scope.loadingData) {
                return;
            }

            if (changeToMessagesTab) {
                $scope.model.activePageTab = "messages";
            }

            $scope.model.failedMessages = [];
            $scope.selectedExceptionGroup = group;
            $scope.allMessagesLoaded = false;
            page = 1;

            $scope.loadMoreResults(group, sort, direction);
        };

        $scope.selectGroup = function(group, sort, direction) {
            selectGroupInternal(group, sort, direction, true);
        };

        $scope.loadMoreResults = function(group) {
            $scope.allMessagesLoaded = $scope.model.failedMessages.length >= group.count;

            if ($scope.allMessagesLoaded || $scope.loadingData) {
                return;
            }

            $scope.loadingData = true;

            var allExceptionsGroupSelected = (!group || !group.id);
            if (allExceptionsGroupSelected) {
                serviceControlService.getFailedMessages(
                    $scope.model.sort,
                    page,
                    $scope.model.direction).then(function (response) {
                    processLoadedMessages(response.data);
                });
            } else {
                serviceControlService.getFailedMessagesForExceptionGroup(
                    group.id,
                    $scope.model.sort,
                    page,
                    $scope.model.direction).then(function (response) {
                    processLoadedMessages(response.data);
                });
            }
        };

        $scope.toggleRowSelect = function(row) {
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

        $scope.getId = function(row) {
            return row.message_id;
        };

        $scope.retryAll = function() {
            serviceControlService.retryAllFailedMessages();
            $scope.init();
        };

        $scope.retrySelected = function() {
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

        var removeGroup = function(group) {
            //remove group
            for (var j = 0; j < $scope.model.exceptionGroups.length; j++) {
                var exGroup = $scope.model.exceptionGroups[j];
                if (group.title === exGroup.title) {
                    $scope.model.exceptionGroups.splice(j, 1);
                }
            }
        };
        var markMessage = function(group, property) {
            //mark messages as retried
            if ($scope.selectedExceptionGroup && group.id === $scope.selectedExceptionGroup.id) {
                for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                    $scope.model.failedMessages[i][property] = true;
                }
            }
        };

        $scope.dismiss = function(group) {

            switch (group.workflow_state.status) {
            case 'error':
                group.workflow_state = createWorkflowState('ready', '');;
                break;
            case 'success':
                removeGroup(group);

                if ($scope.model.exceptionGroups.length === 0) {
                    $scope.model.failedMessages = [];
                }

                break;
            }
        };

        $scope.testSuccess = function(group) {

            //  <!--<button type="button" class="btn btn-default btn-sm" tooltip="Test" ng-click="testSuccess(excGroup)"><i class="fa fa-smile-o"></i></button>-->

            group.workflow_state = { status: 'working', message: 'working' };
            var response = failedMessagesService.wait()
                .then(function(message) {
                    group.workflow_state = createWorkflowState('success', message);
                }, function(message) {
                    group.workflow_state = createWorkflowState('error', message);
                }, function(e) {
                    group.workflow_state = createWorkflowState('working', 'working', 10, e);
                })
                .finally(function() {

                });
        };


        $scope.retryExceptionGroup = function(group) {

            group.workflow_state = { status: 'working', message: 'working' };
            var response = failedMessagesService.retryGroup(group.id, 'Retry Group Request Enqueued', 'Retry Group Request Rejected')
                .then(function(message) {
                    // We are going to have to wait for service control to tell us the job has been done
                    group.workflow_state = createWorkflowState('success', message);

                    markMessage(group, 'retried');
                    //selectGroupInternal($scope.allFailedMessagesGroup, null, false);

                }, function(message) {
                    group.workflow_state = createWorkflowState('error', message);
                })
                .finally(function() {

                });

        };

        $scope.archiveExceptionGroup = function(group) {


            group.workflow_state = { status: 'working', message: 'working' };
            var response = failedMessagesService.archiveGroup(group.id, 'Archive Group Request Enqueued', 'Archive Group Request Rejected')
                .then(function(message) {

                    group.workflow_state = createWorkflowState('success', message);

                    markMessage(group, 'archived');
                    //selectGroupInternal($scope.allFailedMessagesGroup, null, false);

                }, function(message) {
                    group.workflow_state = createWorkflowState('error', message);
                })
                .finally(function() {

                });

        };

        $scope.archiveSelected = function() {
            serviceControlService.archiveFailedMessages($scope.model.selectedIds);
            $scope.model.selectedIds = [];

            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                if ($scope.model.failedMessages[i].selected) {
                    $scope.model.failedMessages[i].selected = false;
                    $scope.model.failedMessages[i].archived = true;
                }
            }
        };

        var updateCountForFailedMessageNotification = function(previousCount, newCount) {
            var notificationText = ' new failed messages. Refresh the page to see them.';
            notifications.removeByText(previousCount + notificationText);
            notifications.pushForCurrentRoute(newCount + notificationText, 'info');

        };

        var subscriptionDisposalMethods = [];

        subscriptionDisposalMethods.push(streamService.subscribe('MessageFailed', function(event) {
            var failedMessageId = event.failed_message_id;
            $scope.allFailedMessagesGroup.count++;

            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                var existingFailure = $scope.model.failedMessages[i];
                if (failedMessageId === existingFailure.id && existingFailure.retried) {
                    existingFailure.retried = false;
                    return;
                }
            }

            updateCountForFailedMessageNotification($scope.model.newMessages, ++$scope.model.newMessages);
        }));

        subscriptionDisposalMethods.push(streamService.subscribe('MessageFailureResolved', function(event) {

            var failedMessageId = event.failed_message_id;
            $scope.allFailedMessagesGroup.count--;

            for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                var existingFailure = $scope.model.failedMessages[i];
                if (failedMessageId === existingFailure.id) {
                    $scope.model.failedMessages.splice(i, 1);
                    return;
                }
            }

            $scope.model.newMessages--;

        }));

        subscriptionDisposalMethods.push(streamService.subscribe('FailedMessageGroupArchived', function(event) {
            notifications.pushForCurrentRoute('Messages from group \'' + event.group_name + '\' were successfully archived.', 'info');
        }));

        $scope.$on('$destroy', function() {
            for (var i = 0; i < subscriptionDisposalMethods.length; i++) {
                subscriptionDisposalMethods[i]();
            }
        });

        $scope.init();
    };

    controller.$inject = [
        '$scope',
        '$window',
        '$timeout',
        '$routeParams',
        'scConfig',
        'notifications',
        'semverService',
        'serviceControlService',
        'failedMessagesService',
        'streamService'
    ];

    angular
        .module('failedMessages')
        .controller('FailedMessagesCtrl', controller);

}(window, window.angular));