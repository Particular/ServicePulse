;
(function(window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $timeout,
        $location,
        $routeParams,
        $cookies,
        scConfig,
        toastService,
        sharedDataService,
        notifyService,
        serviceControlService,
        failedMessageGroupsService) {

        var vm = this;

        var notifier = notifyService();

        vm.selectedExceptionGroup = { 'id': $routeParams.groupId ? $routeParams.groupId : undefined, 'title': 'All Failed Messages', 'count': 0, 'initialLoad': true };
        vm.selectedExceptionGroup.parentTitle = $routeParams.parentGroupId;
        vm.selectedExceptionGroup.parentGroupIndex = $routeParams.parentGroupIndex;

        if (!vm.selectedExceptionGroup.hasOwnProperty('title')) {
            $location.path('/failed-messages/groups');
        }

        var selectActions = {
            Selection: { },
            Deselection: { }
        };

        vm.stats = sharedDataService.getstats();
        vm.failedMessages = [];
        vm.selectedIds = [];
        vm.multiselection = {};
        vm.sortButtonText = '';
        vm.allMessagesLoaded = false;
        vm.loadingData = false;
        vm.lastAction = selectActions.Selection;
        vm.page = 1;
        vm.total = vm.stats.number_of_failed_messages;

        notifier.subscribe($scope, function (event, data) {
            vm.total = data;
        }, 'MessageFailuresUpdated');

        var setSortButtonText = function(sort, direction) {
            vm.sortButtonText = (sort === 'message_type' ? "Message Type" : "Time of Failure") + " " + (direction === 'asc' ? "ASC" : "DESC");
        };

        var saveSortOption = function(sort, direction) {
            $cookies.put('failed_messages_sort', sort);
            $cookies.put('failed_messages_direction', direction);
        };

        var processLoadedMessages = function (data) {
            if (data.length > 0) {
                var exgroups = data.map(function(obj) {
                    var nObj = obj;
                    nObj.panel = 0;
                    return nObj;
                });

                vm.failedMessages = vm.failedMessages.concat(exgroups);
                vm.allMessagesLoaded = (vm.failedMessages.length >= vm.selectedExceptionGroup.count);
                vm.page++;
            }
            vm.loadingData = false;
        };

        var loadGroupDetails = function() {
            if (vm.selectedExceptionGroup.initialLoad && vm.selectedExceptionGroup.id) {
                    serviceControlService.getExceptionGroup(vm.selectedExceptionGroup.id).then(function (result) {
                        vm.selectedExceptionGroup.title = result.data.title;
                });
            }
        };

        var getDefaultSort = function() {
            var sort = $cookies.get("failed_messages_sort");
            var direction = $cookies.get("failed_messages_direction");

            if (typeof sort === "undefined") sort = "time_of_failure";
            if (typeof direction === "undefined") direction = "desc";

            return {
                sort: sort,
                direction: direction
            }
        };

        var init = function () {

            var defaultSort = getDefaultSort();

            vm.failedMessages = [];
            vm.selectedIds = [];
            vm.page = 1;
            vm.sort = defaultSort.sort;
            vm.direction = defaultSort.direction;

            loadGroupDetails();
            setSortButtonText(vm.sort, vm.direction);
            vm.loadMoreResults(vm.selectedExceptionGroup);
        };

        vm.viewMessage = function (message) {
            $location.path(`/failed-messages/message/${message.id}`);
        };

        vm.retryMessage = function(message, $event) {
            toastService.showInfo("Message retry requested");
            serviceControlService.retryFailedMessages([message.id])
                .then(function() {
                        var indexOfMessage = vm.selectedIds.indexOf(message.id);
                        if (indexOfMessage) {
                            vm.selectedIds.splice(indexOfMessage, 1);
                        }

                        vm.failedMessages = vm.failedMessages.filter(function(item) {
                            return item.id !== message.id;
                        });
                    }
                );
            $event.stopPropagation();
        };

        vm.clipComplete = function(messageId) {
            toastService.showInfo(messageId + ' copied to clipboard');
        };

        vm.retrySelected = function () {
            toastService.showInfo("Retrying " + vm.selectedIds.length + " messages...");
            serviceControlService.retryFailedMessages(vm.selectedIds)
                .then(function () {
                    vm.selectedIds = [];

                    vm.failedMessages = vm.failedMessages.filter(function(item) {
                        return !item.selected;
                    });
                });
        };

        vm.archiveSelected = function () {
            toastService.showInfo("Archiving " + vm.selectedIds.length + " messages...");
            serviceControlService.archiveFailedMessages(vm.selectedIds)
                .then(function () {
                    vm.selectedIds = [];

                    vm.failedMessages = vm.failedMessages.filter(function(item) {
                        return !item.selected;
                    });
                });
        };

        vm.archiveExceptionGroup = function (group) {
            failedMessageGroupsService.archiveGroup(group.id, 'Archive Group Request Enqueued', 'Archive Group Request Rejected')
                .then(function (message) {
                    notifier.notify('ArchiveGroupRequestAccepted', group);
                    vm.failedMessages = [];
                }, function (message) {
                    notifier.notify('ArchiveGroupRequestRejected', group);
                })
                .finally(function () {

                });
        };

        vm.retryExceptionGroup = function (group) {

            if (!group.id) {
                serviceControlService.retryAllFailedMessages();
                toastService.showInfo('Retrying all messages...');
                vm.failedMessages = [];
                return;
            }

            failedMessageGroupsService.retryGroup(group.id, 'Retry Group Request Enqueued', 'Retry Group Request Rejected')
                .then(function (message) {
                    notifier.notify('RetryGroupRequestAccepted', group);
                    toastService.showInfo('Retrying all messages...');
                    vm.failedMessages = [];
                }, function (message) {
                    notifier.notify('RetryGroupRequestRejected', group);
                })
                .finally(function () {

                });
        };

        var selectGroupInternal = function (group, sort, direction, changeToMessagesTab) {
            if ($scope.loadingData) {
                return;
            }

            vm.sort = sort;
            vm.direction = direction;
            saveSortOption(sort, direction);
            setSortButtonText(sort, direction);

            if (changeToMessagesTab) {
                vm.activePageTab = "messages";
            }

            vm.failedMessages = [];
            vm.selectedExceptionGroup = group;
            vm.allMessagesLoaded = false;
            vm.page = 1;

            vm.loadMoreResults(group, sort, direction);
        };

        vm.selectGroup = function (group, sort, direction) {
            selectGroupInternal(group, sort, direction, true);
        };

        vm.loadMoreResults = function(group) {
            vm.allMessagesLoaded = vm.failedMessages.length >= group.count;

            if (!group.initialLoad && (vm.allMessagesLoaded || vm.loadingData)) {
                return;
            }

            vm.loadingData = true;
            delete group.initialLoad;

            var allExceptionsGroupSelected = (!group || !group.id);

            var loadPromise;
            if (allExceptionsGroupSelected) {
                loadPromise = serviceControlService.getFailedMessages(vm.sort, vm.page, vm.direction);
            } else {
                loadPromise = serviceControlService.getFailedMessagesForExceptionGroup(group.id, vm.sort, vm.page, vm.direction);
            }

            loadPromise.then(function (response) {
                if (group.count === 0) {
                    group.count = response.total;
                }

                processLoadedMessages(response.data);
            });
        };

        init();
    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$location",
        "$routeParams",
        "$cookies",
        "scConfig",
        "toastService",
        "sharedDataService",
        "notifyService",
        "serviceControlService",
        "failedMessageGroupsService"
    ];

    angular.module("sc")
        .controller("failedMessagesController", controller);

})(window, window.angular);