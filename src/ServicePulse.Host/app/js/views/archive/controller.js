;
(function (window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $log,
        $timeout,
        moment,
        $location,
        $cookies,
        scConfig,
        sharedDataService,
        notifyService,
        serviceControlService,
        failedMessageGroupsService,
        archivedMessageService) {

        var vm = this;
        var notifier = notifyService();

        vm.selectedIds = [];
        vm.multiselection = {};

        vm.stats = sharedDataService.getstats();

        vm.sort = {
            sortby: 'modified',
            direction: 'desc',
            page: 1,
            start: undefined,
            end: undefined,
            buttonText: function () {
                return (vm.sort.sortby === 'message_type' ? "Message Type" : "Time Archived") + " " + (vm.sort.direction === 'asc' ? "ASC" : "DESC");
            }
        };

        vm.timeGroup = {
            amount: 2,
            unit: 'hours',
            buttonText: 'Archived in the last 2 Hours',
            selected: function () {
                return moment.duration(vm.timeGroup.amount, vm.timeGroup.unit);;
            }
        };

        vm.allMessagesLoaded = false;
        vm.loadingData = false;
        vm.archives = [{}];
        vm.error_retention_period = moment.duration("10.00:00:00").asHours();
        vm.allFailedMessagesGroup = { 'id': undefined, 'title': 'All Failed Messages', 'count': 0 }

        var localtimeout;
        
        var processLoadedMessages = function (data) {

            if (data && data.length > 0) {

                var exgroups = data.map(function (obj) {
                    var nObj = obj;
                    nObj.panel = 0;
                   
                    var countdown = moment(nObj.last_modified).add(vm.error_retention_period, 'hours');
                    nObj.delete_soon = countdown < moment();
                    nObj.deleted_in = countdown.format();
                    return nObj;
                });

                vm.archives = vm.archives.concat(exgroups);
                vm.allMessagesLoaded = (vm.archives.length >= vm.total);
                vm.page++;
            }

            vm.loadingData = false;
        };

        var saveSelectedArchiveGroup = function (amount, unit) {
            $cookies.put('archive_amount', amount);
            $cookies.put('archive_unit', unit);
        };

        var getSelectedArchiveGroup = function () {
            var amount = $cookies.get("archive_amount");
            var unit = $cookies.get("archive_unit");

            return {
                amount: amount,
                unit: unit
            }
        };

        var init = function () {

            vm.configuration = sharedDataService.getConfiguration();
            vm.error_retention_period = moment.duration(vm.configuration.data_retention.error_retention_period).asHours();
            vm.total = 1;
            vm.archives = [];
            vm.sort.page = 1;

            var selectedArchiveGroup = getSelectedArchiveGroup();

            vm.selectTimeGroup(selectedArchiveGroup.amount, selectedArchiveGroup.unit);
            vm.allFailedMessagesGroup.count = vm.stats.number_of_failed_messages;
            vm.loadMoreResults();
        };

        var startTimer = function (time) {
            time = time || 3000;
            localtimeout = $timeout(function () {

                init();
            }, time);
        };

        vm.restore = function (timeGroup) {
            var rangeEnd = moment.utc();
            var rangeStart = moment.utc().subtract(timeGroup.amount, timeGroup.unit);
            archivedMessageService.restoreFromArchive(rangeStart, rangeEnd, 'Restore From Archive Request Accepted', 'Restore From Archive Request Rejected');

            startTimer();
        };

        var markMessage = function (property) {
            for (var i = 0; i < vm.failedMessages.length; i++) {
                vm.failedMessages[i][property] = true;
            }
        };

        vm.togglePanel = function (message, panelnum) {
            if (message.messageBody === undefined) {
                serviceControlService.getMessageBody(message.message_id).then(function (msg) {
                    message.messageBody = msg.data;
                }, function () {
                    message.bodyUnavailable = "message body unavailable";
                });
            }

            if (message.messageHeaders === undefined) {
                serviceControlService.getMessageHeaders(message.message_id).then(function (msg) {
                    message.messageHeaders = msg.data[0].headers;
                }, function () {
                    message.headersUnavailable = "message headers unavailable";
                });
            }
            message.panel = panelnum;
            return false;
        };

        vm.unarchiveSelected = function () {
            archivedMessageService.restoreMessagesFromArchive(vm.selectedIds, 'Restore From Archive Request Accepted', 'Restore From Archive Request Rejected')
                .then(function (message) {
                    vm.archives.reduceRight(function (acc, obj, idx) {
                        if (vm.selectedIds.indexOf(obj.id) > -1)
                            vm.archives.splice(idx, 1);
                    }, 0);
                    // We are going to have to wait for service control to tell us the job has been done
                    // group.workflow_state = createWorkflowState('success', message);
                    notifier.notify('RestoreFromArchiveRequestAccepted');

                }, function (message) {
                    // group.workflow_state = createWorkflowState('error', message);
                    notifier.notify('RestoreFromArchiveRequestRejected');
                })
                .finally(function () {
                    vm.selectedIds = [];
                });
        };

        vm.archiveExceptionGroup = function (group) {

            failedMessageGroupsService.archiveGroup(group.id, 'Archive Group Request Enqueued', 'Archive Group Request Rejected')
                .then(function (message) {
                    notifier.notify('ArchiveGroupRequestAccepted', group);
                    markMessage('archived');
                }, function (message) {
                    notifier.notify('ArchiveGroupRequestRejected', group);
                })
                .finally(function () {

                });
        };

        vm.retryExceptionGroup = function (group) {
            markMessage('retried');

            if (!group.id) {
                serviceControlService.retryAllFailedMessages();
                return;
            }

            failedMessageGroupsService.retryGroup(group.id, 'Retry Group Request Enqueued', 'Retry Group Request Rejected')
                .then(function (message) {
                    notifier.notify('RetryGroupRequestAccepted', group);
                }, function (message) {
                    notifier.notify('RetryGroupRequestRejected', group);
                })
                .finally(function () {

                });
        };

        var selectGroupInternal = function (sortby, direction) {

            vm.sort.sortby = sortby || vm.sort.sortby;
            vm.sort.direction = direction || vm.sort.direction;

            if (vm.loadingData) {
                return;
            }

            vm.selectedIds = [];
            vm.archives = [];
            vm.allMessagesLoaded = false;
            vm.total = 1;
            vm.page = 1;
            vm.loadMoreResults();
        };

        vm.selectGroup = function (sortby, direction) {
            selectGroupInternal(sortby, direction, true);
        };

        vm.selectTimeGroup = function (amount, unit) {
            vm.timeGroup.amount = amount;
            vm.timeGroup.unit = unit;

            if (amount && unit) {

                switch (amount) {
                    case '2':
                        vm.timeGroup.buttonText = 'Archived in the last 2 Hours';
                        break;
                    case '1':
                        vm.timeGroup.buttonText = 'Archived in the last 1 Day';
                        break;
                    case '7':
                        vm.timeGroup.buttonText = 'Archived in the last 7 Days';
                        break;
                    default:
                        vm.timeGroup.buttonText = amount + ' ' + unit;
                        break;
                }
                vm.sort.start = moment.utc().subtract(amount, unit).format('YYYY-MM-DDTHH:mm:ss');
                vm.sort.end = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
            } else {
                vm.timeGroup.buttonText = 'All Archived';
                vm.sort.start = vm.sort.end = undefined;
            }

            saveSelectedArchiveGroup(amount, unit);
            selectGroupInternal();
        };

        vm.loadMoreResults = function () {
            vm.allMessagesLoaded = vm.archives.length >= vm.total;

            if (vm.allMessagesLoaded || vm.loadingData) {
                return;
            }

            vm.loadingData = true;

            archivedMessageService.getArchivedMessages(
                vm.sort.sortby,
                vm.sort.page,
                vm.sort.direction,
                vm.sort.start,
                vm.sort.end).then(function (response) {
                    vm.total = response.total;
                    processLoadedMessages(response.data);
                });
        };

        init();
    }

    controller.$inject = [
        "$scope",
        "$log",
        "$timeout",
        "moment",
        "$location",
        "$cookies",
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