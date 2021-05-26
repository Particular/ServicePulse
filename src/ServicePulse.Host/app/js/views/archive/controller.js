(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        $log,
        $timeout,
        moment,
        $routeParams,
        $cookies,
        sharedDataService,
        notifyService,
        serviceControlService,
        failedMessageGroupsService,
        archivedMessageService) {

        serviceControlService.performingDataLoadInitially = true;

        var vm = this;
        var notifier = notifyService();

        vm.selectedIds = [];
        vm.multiselection = {};

        vm.stats = sharedDataService.getstats();

        vm.selectedArchiveGroup = { 'id': $routeParams.groupId ? $routeParams.groupId : undefined, 'title': 'All deleted messages', 'count': 0, 'initialLoad': true };

        vm.pager = {
            page: 1,
            total: 1,
            perPage: 50
        };

        vm.sort = {
            sortby: 'modified',
            direction: 'desc',
            start: undefined,
            end: undefined,
            buttonText: function () {
                return (vm.sort.sortby === 'message_type' ? 'Message Type' : 'Time Deleted') + ' ' + (vm.sort.direction === 'asc' ? 'ASC' : 'DESC');
            }
        };

        vm.timeGroup = {
            amount: 2,
            unit: 'hours',
            buttonText: 'Deleted in the last 2 hours',
            selected: function () {
                return moment.duration(vm.timeGroup.amount, vm.timeGroup.unit);
            }
        };

        vm.allMessagesLoaded = false;
        vm.loadingData = false;
        vm.archives = [{}];
        vm.error_retention_period = moment.duration('10.00:00:00').asHours();
        vm.allFailedMessagesGroup = { 'id': undefined, 'title': 'All Failed Messages', 'count': 0 };

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

                vm.selectedIds = [];
                vm.archives = exgroups;
                vm.allMessagesLoaded = (vm.archives.length >= vm.total);
            }

            vm.loadingData = false;
        };

        var saveSelectedArchiveGroup = function (amount, unit) {
            $cookies.put('archive_amount', amount);
            $cookies.put('archive_unit', unit);
        };

        var getSelectedArchiveGroup = function () {
            var amount = $cookies.get('archive_amount');
            var unit = $cookies.get('archive_unit');

            return {
                amount: amount,
                unit: unit
            };
        };

        var init = function () {

            vm.configuration = sharedDataService.getConfiguration();
            vm.error_retention_period = moment.duration(vm.configuration.data_retention.error_retention_period).asHours();
            vm.pager.total = 1;
            vm.archives = [];
            vm.pager.page = 1;

            var selectedArchiveGroup = getSelectedArchiveGroup();

            vm.selectTimeGroup(selectedArchiveGroup.amount, selectedArchiveGroup.unit);
            vm.allFailedMessagesGroup.count = vm.stats.number_of_failed_messages;
            loadGroupDetails();
            vm.loadMoreResults();
        };

        var startTimer = function (time) {
            time = time || 3000;
            $timeout(function () {

                init();
            }, time);
        };

        vm.restore = function (timeGroup) {
            var rangeEnd = moment.utc();
            var rangeStart = moment.utc().subtract(timeGroup.amount, timeGroup.unit);
            archivedMessageService.restoreFromArchive(rangeStart, rangeEnd, 'Request to restore message accepted', 'Request to restore message rejected');

            startTimer();
        };

        var markMessage = function (property) {
            for (var i = 0; i < vm.failedMessages.length; i++) {
                vm.failedMessages[i][property] = true;
            }
        };

        vm.selectAllMessages = function() {
            var selectAll = true;
            if(vm.selectedIds.length > 0) {
                selectAll = false;
            }
            vm.selectedIds = [];
            vm.archives.forEach(function(item) {
                if (selectAll) {
                    item.selected = true;
                    vm.selectedIds.push(item.id);
                } else {
                    item.selected = false;
                }
            });
        };

        vm.unarchiveSelected = function () {
            archivedMessageService.restoreMessagesFromArchive(vm.selectedIds, 'Request to restore message accepted', 'Request to restore message rejected')
                .then(function (message) {
                    vm.archives.reduceRight(function (acc, obj, idx) {
                        if (vm.selectedIds.indexOf(obj.id) > -1)
                            vm.archives.splice(idx, 1);
                    }, 0);
                    // We are going to have to wait for service control to tell us the job has been done
                    // group.workflow_state = createWorkflowState('success', message);
                    notifier.notify('RestoreFromArchiveRequestAccepted');
                    $scope.$emit('list:updated');

                }, function (message) {
                    // group.workflow_state = createWorkflowState('error', message);
                    notifier.notify('RestoreFromArchiveRequestRejected');
                })
                .finally(function () {
                    vm.selectedIds = [];
                });
        };

        vm.archiveExceptionGroup = function (group) {

            failedMessageGroupsService.archiveGroup(group.id, 'Delete group request enqueued', 'Delete group request rejected')
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
            vm.pager.total = 1;
            vm.pager.page = 1;
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
                        vm.timeGroup.buttonText = 'Deleted in the last 2 hours';
                        break;
                    case '1':
                        vm.timeGroup.buttonText = 'Deleted in the last 1 day';
                        break;
                    case '7':
                        vm.timeGroup.buttonText = 'Deleted in the last 7 days';
                        break;
                    default:
                        vm.timeGroup.buttonText = amount + ' ' + unit;
                        break;
                }
                vm.sort.start = moment.utc().subtract(amount, unit).format('YYYY-MM-DDTHH:mm:ss');
                vm.sort.end = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
            } else {
                vm.timeGroup.buttonText = 'All deleted';
                vm.sort.start = vm.sort.end = undefined;
            }

            saveSelectedArchiveGroup(amount, unit);
            selectGroupInternal();
        };

        var loadGroupDetails = function() {
            if (vm.selectedArchiveGroup.initialLoad && vm.selectedArchiveGroup.id) {
                    archivedMessageService.getArchiveGroup(vm.selectedArchiveGroup.id).then(function (result) {
                        vm.selectedArchiveGroup.title = result.data.title;
                });
            }
        };

        vm.loadMoreResults = function () {
            vm.allMessagesLoaded = vm.archives.length >= vm.pager.total;

            if (vm.allMessagesLoaded || vm.loadingData) {
                return;
            }

            vm.loadingData = true;

            archivedMessageService.getArchivedMessages(
                vm.selectedArchiveGroup.id,
                vm.sort.sortby,
                vm.pager.page,
                vm.sort.direction,
                vm.sort.start,
                vm.sort.end).then(function (response) {
                    notifier.notify('InitialLoadComplete');

                    vm.pager.total = response.total;
                    processLoadedMessages(response.data);
                });
        };

        init();
    }

    controller.$inject = [
        '$scope',
        '$log',
        '$timeout',
        'moment',
        '$routeParams',
        '$cookies',
        'sharedDataService',
        'notifyService',
        'serviceControlService',
        'failedMessageGroupsService',
        'archivedMessageService'
    ];

    angular.module('sc')
        .controller('archivedMessageController', controller);

})(window, window.angular);
