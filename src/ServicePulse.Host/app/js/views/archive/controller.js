;
(function(window, angular, undefined) {
    "use strict";

    function createWorkflowState(optionalStatus, optionalMessage, optionalTotal, optionalCount) {
        return {
            status: optionalStatus || 'working',
            message: optionalMessage || 'working',
            total: optionalTotal || 0,
            count: optionalCount || 0
        };
    }

    function controller(
        $scope,
        $log,
        $timeout,
        $interval,
        $location,
        $moment,
        sharedDataService,
        notifyService,
        archivedMessageService) {

        var vm = this;
        var notifier = notifyService();

        vm.sortButtonText = '';
        vm.sort = "modified";
        vm.direction = "desc";
        vm.allMessagesLoaded = false;
        vm.loadingData = false;
        vm.page = 1;
        vm.archives = [{}];
        vm.error_retention_period = $moment.duration("10.00:00:00").asHours();

        vm.currentGroupLabel = '';
        vm.showGroupLabel = function (label) {
            if (vm.sort === 'modified' && vm.currentGroupLabel !== label) {
                vm.currentGroupLabel = label;
                return true;
            }
            return false;
        }

        var setSortButtonText = function(sort, direction) {
            vm.sortButtonText = (sort === 'message_type' ? "Message Type" : "Archived") + " " + (direction === 'asc' ? "ASC" : "DESC");
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
                    timeGroup.label = 'Archived less than ' + duration.humanize() + ' ago';
                    break;
                }
            }

            return timeGroup;
        }

        var processLoadedMessages = function(data) {

            if (data && data.length > 0) {

                var exgroups = data.map(function(obj) {
                    var nObj = obj;
                    nObj.panel = 0;
                    if (vm.sort === 'modified') {
                        nObj.timeGroup = determineTimeGrouping(nObj.last_modified);
                    }
                    nObj.deleted_in = $moment(nObj.last_modified).add(vm.error_retention_period, 'hours').format();
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
            vm.loadMoreResults();
        }

        vm.restore = function(amount, unit) {
            var rangeEnd = moment.utc();
            var rangeStart = moment.utc().subtract(amount, unit);

            archivedMessageService.restoreFromArchive(rangeStart, rangeEnd, 'Restore From Archive Request Accepted', 'Restore From Archive Request Rejected')
                .then(function(message) {
                    // We are going to have to wait for service control to tell us the job has been done
                    // group.workflow_state = createWorkflowState('success', message);
                    notifier.notify('RestoreFromArchiveRequestAccepted');

                }, function(message) {
                    // group.workflow_state = createWorkflowState('error', message);
                    notifier.notify('RestoreFromArchiveRequestRejected');
                })
                .finally(function() {

                });
        }

        vm.restoreMessage = function(id) {

            archivedMessageService.restoreMessageFromArchive(id, 'Restore From Archive Request Accepted', 'Restore From Archive Request Rejected')
                .then(function(message) {
                    // We are going to have to wait for service control to tell us the job has been done
                    // group.workflow_state = createWorkflowState('success', message);
                    notifier.notify('RestoreFromArchiveRequestAccepted');

                }, function(message) {
                    // group.workflow_state = createWorkflowState('error', message);
                    notifier.notify('RestoreFromArchiveRequestRejected');
                })
                .finally(function() {

                });
        }

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
        "$interval",
        "$location",
        "$moment",
        "sharedDataService",
        "notifyService",
        "archivedMessageService"
    ];

    angular.module("sc")
        .controller("archivedMessageController", controller);

})(window, window.angular);