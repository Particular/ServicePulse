;
(function(window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $log,
        $timeout,
        $moment,
        $location,
        scConfig,
        sharedDataService,
        notifyService,
        serviceControlService,
        failedMessageGroupsService,
        archivedMessageService) {

        var vm = this;
        var notifier = notifyService();


        vm.selectedIds = [];
        vm.sortButtonText = '';


        vm.stats = sharedDataService.getstats();
        vm.sortButtonText = '';
        vm.sort = "modified";
        vm.direction = "desc";
        vm.allMessagesLoaded = false;
        vm.loadingData = false;
        vm.page = 1;
        vm.archives = [{}];
        vm.error_retention_period = $moment.duration("10.00:00:00").asHours();
        vm.allFailedMessagesGroup = { 'id': undefined, 'title': 'All Failed Messages', 'count': 0 }

        vm.viewExceptionGroup = function(group) {
            sharedDataService.set(group);
            $location.path('/failedMessages');
        }

        notifier.subscribe($scope, function (event, data) {
            vm.stats.number_of_failed_messages = data;
            vm.allFailedMessagesGroup.count = vm.stats.number_of_failed_messages;
        }, 'MessageFailuresUpdated');

        notifier.subscribe($scope, function (event, data) {
            vm.stats.number_of_archived_messages = data;
        }, 'ArchivedMessagesUpdated');

        var localtimeout;

        var setSortButtonText = function(sort, direction) {
            vm.sortButtonText = (sort === 'message_type' ? "Message Type" : "Time Archived") + " " + (direction === 'asc' ? "ASC" : "DESC");
        }




        var determineTimeGrouping = function(lastModified) {

            // THE ORDER OF DURATIONS MATTERS
            var categories = [
                { amount: 2, unit: 'hours' },
                { amount: 1, unit: 'days' },
                { amount: 7, unit: 'days' }
            ];

            var current = $moment.duration($moment() - $moment(lastModified));
            var last = categories[categories.length - 1];
            var timeGroup = 'Archived more than ' + $moment.duration(last.amount, last.unit).humanize() + ' ago';

            for (var i = 0; i < categories.length; i++) {
                var c = categories[i];
                var duration = $moment.duration(c.amount, c.unit);

                if (current.hours() <= duration.asHours()) {
                    timeGroup = c;
                    timeGroup.class = 'timegroup' + i;
                    timeGroup.label = 'Archived less than ' + duration.humanize() + ' ago';
                    break;
                }
            }

            return timeGroup;
        }

        var currentGroupLabel = '';


        notifier.subscribe($scope, function(event, data) {
            vm.stats.number_of_failed_messages = data;
        }, 'MessageFailuresUpdated');

        notifier.subscribe($scope, function(event, data) {
            vm.stats.number_of_archived_messages = data;
        }, 'ArchivedMessagesUpdated');


        var processLoadedMessages = function(data) {

            if (data && data.length > 0) {

                var exgroups = data.map(function(obj) {
                    var nObj = obj;
                    nObj.panel = 0;
                    if (vm.sort === 'modified') {
                        nObj.timeGroup = determineTimeGrouping(nObj.last_modified);
                        nObj.showGroupLabel = false;
                        if (currentGroupLabel !== nObj.timeGroup.label) {
                            currentGroupLabel = nObj.timeGroup.label;
                            nObj.showGroupLabel = true;
                        }
                    }
                    var countdown = $moment(nObj.last_modified).add(vm.error_retention_period, 'hours');
                    // if deleted_in is negative write schedulaed for immediate deletion
                    $log.debug($moment());
                    $log.debug(countdown);

                    nObj.delete_soon = countdown < $moment();
                    nObj.deleted_in = countdown.format();
                    return nObj;
                });

                vm.archives = vm.archives.concat(exgroups);
                vm.allMessagesLoaded = (vm.archives.length >= vm.total);
                vm.page++;
            }

            vm.loadingData = false;
        };

        var init = function() {
            vm.configuration = sharedDataService.getConfiguration();
            vm.error_retention_period = $moment.duration(vm.configuration.data_retention.error_retention_period).asHours();
            vm.total = 1;
            vm.archives = [];
            vm.page = 1;
            setSortButtonText(vm.sort, vm.direction);

            vm.allFailedMessagesGroup.count = vm.stats.number_of_failed_messages;
            vm.loadMoreResults();
        }


        var startTimer = function (time) {
            time = time || 3000;
            localtimeout = $timeout(function () {

                init();
            }, time);
        }

        vm.restore = function (timeGroup) {
            var rangeEnd = moment.utc();
            var rangeStart = moment.utc().subtract(timeGroup.amount, timeGroup.unit);

            archivedMessageService.restoreFromArchive(rangeStart, rangeEnd, 'Restore From Archive Request Accepted', 'Restore From Archive Request Rejected')

            startTimer();
        }

        var markMessage = function(property) {
            for (var i = 0; i < vm.failedMessages.length; i++) {
                vm.failedMessages[i][property] = true;
            }
        };

        vm.togglePanel = function(message, panelnum) {
            if (message.messageBody === undefined) {
                serviceControlService.getMessageBody(message.message_id).then(function(msg) {
                    message.messageBody = msg.data;
                }, function() {
                    message.bodyUnavailable = "message body unavailable";
                });
            }

            if (message.messageHeaders === undefined) {
                serviceControlService.getMessageHeaders(message.message_id).then(function(msg) {
                    message.messageHeaders = msg.data[0].headers;
                }, function() {
                    message.headersUnavailable = "message headers unavailable";
                });
            }
            message.panel = panelnum;
            return false;
        };

        vm.toggleRowSelect = function(row) {
            if (row.retried || row.archived) {
                return;
            }

            row.selected = !row.selected;

            if (row.selected) {
                vm.selectedIds.push(row.id);
            } else {
                vm.selectedIds.splice(vm.selectedIds.indexOf(row.id), 1);
            }
        };


        vm.retrySelected = function() {
            serviceControlService.retryFailedMessages(vm.selectedIds);
            vm.selectedIds = [];

            for (var i = 0; i < vm.failedMessages.length; i++) {
                if (vm.failedMessages[i].selected) {
                    vm.failedMessages[i].selected = false;
                    vm.failedMessages[i].retried = true;
                }
            }
        };

        vm.unarchiveSelected = function() {

            archivedMessageService.restoreMessagesFromArchive(vm.selectedIds, 'Restore From Archive Request Accepted', 'Restore From Archive Request Rejected')
                .then(function(message) {

                    vm.archives.reduceRight(function(acc, obj, idx) {
                        if (vm.selectedIds.indexOf(obj.id) > -1)
                            vm.archives.splice(idx, 1);
                    }, 0);

                    // We are going to have to wait for service control to tell us the job has been done
                    // group.workflow_state = createWorkflowState('success', message);
                    notifier.notify('RestoreFromArchiveRequestAccepted');

                }, function(message) {
                    // group.workflow_state = createWorkflowState('error', message);
                    notifier.notify('RestoreFromArchiveRequestRejected');
                })
                .finally(function() {
                    vm.selectedIds = [];
                });


        };

        vm.archiveExceptionGroup = function(group) {


            var response = failedMessageGroupsService.archiveGroup(group.id, 'Archive Group Request Enqueued', 'Archive Group Request Rejected')
                .then(function(message) {
                    notifier.notify('ArchiveGroupRequestAccepted', group);
                    markMessage('archived');
                }, function(message) {
                    notifier.notify('ArchiveGroupRequestRejected', group);
                })
                .finally(function() {

                });
        }

        vm.retryExceptionGroup = function(group) {
            markMessage('retried');

            if (!group.id) {
                serviceControlService.retryAllFailedMessages();
                return;
            }

            var response = failedMessageGroupsService.retryGroup(group.id, 'Retry Group Request Enqueued', 'Retry Group Request Rejected')
                .then(function(message) {
                    notifier.notify('RetryGroupRequestAccepted', group);
                }, function(message) {
                    notifier.notify('RetryGroupRequestRejected', group);
                })
                .finally(function() {

                });
        }


        var selectGroupInternal = function(sort, direction) {
            vm.sort = sort;
            vm.direction = direction;
            setSortButtonText(sort, direction);

            if (vm.loadingData) {
                return;
            }

            vm.archives = [];
            vm.allMessagesLoaded = false;
            vm.page = 1;

            vm.loadMoreResults();
        };

        vm.selectGroup = function(sort, direction) {
            selectGroupInternal(sort, direction, true);
        };


        vm.loadMoreResults = function() {
            vm.allMessagesLoaded = vm.archives.length >= vm.total;

            if (vm.allMessagesLoaded || vm.loadingData) {
                return;
            }

            vm.loadingData = true;

            archivedMessageService.getArchivedMessages(
                vm.sort,
                vm.page,
                vm.direction).then(function(response) {
                vm.total = response.total;
                processLoadedMessages(response.data);
            });

        }

        init();
    }

    controller.$inject = [
        "$scope",
        "$log",
        "$timeout",
        "$moment",
        "$location",
        "scConfig",
        "sharedDataService",
        "notifyService",
        "serviceControlService",
        "failedMessageGroupsService",
        "archivedMessageService"
    ];

    angular.module("sc")
        .controller("archivedMessageController", controller);

})(window, window.angular);