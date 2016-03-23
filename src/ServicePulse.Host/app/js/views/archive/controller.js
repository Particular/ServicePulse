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

        vm.stats = sharedDataService.getstats();
        vm.sortButtonText = '';
        vm.sort = "modified";
        vm.direction = "desc";
        vm.allMessagesLoaded = false;
        vm.loadingData = false;
        vm.page = 1;
        vm.archives = [{}];
        vm.error_retention_period = $moment.duration("10.00:00:00").asHours();

        var localtimeout;

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
                    timeGroup.class = 'timegroup' + i;
                    timeGroup.label = 'Archived less than ' + duration.humanize() + ' ago';
                    break;
                }
            }

            return timeGroup;
        }

        var currentGroupLabel = '';

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
                .then(function(message) {
                    // We are going to have to wait for service control to tell us the job has been done
                    // group.workflow_state = createWorkflowState('success', message);
                    notifier.notify('RestoreFromArchiveRequestAccepted');

                }, function(message) {
                    // group.workflow_state = createWorkflowState('error', message);
                    notifier.notify('RestoreFromArchiveRequestRejected');
                })
                .finally(function() {
                    startTimer();
                });
        }

        vm.restoreMessage = function (item) {

            archivedMessageService.restoreMessageFromArchive(item.id, 'Restore From Archive Request Accepted', 'Restore From Archive Request Rejected')
                .then(function (message) {

                    var index = vm.archives.indexOf(item);
                    vm.archives.splice(index, 1);

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

        $scope.$on("$destroy", function (event) {
            $timeout.cancel(localtimeout);
        });

        notifier.subscribe($scope, function (event, data) {
            vm.stats.number_of_failed_messages = data;
        }, 'MessageFailuresUpdated');

        notifier.subscribe($scope, function (event, data) {
            vm.stats.number_of_archived_messages = data;
        }, 'ArchivedMessagesUpdated');

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