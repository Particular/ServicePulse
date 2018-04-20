;
(function(window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $timeout,
        $location,
        $routeParams,
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
        vm.lastSelectedIndex = -1;
        vm.sortButtonText = '';
        vm.sort = "time_of_failure";
        vm.direction = "desc";
        vm.allMessagesLoaded = false;
        vm.loadingData = false;
        vm.lastAction = selectActions.Selection;
        vm.page = 1;
        vm.total = vm.stats.number_of_failed_messages;

        notifier.subscribe($scope, function (event, data) {
            vm.total = data;
        }, 'MessageFailuresUpdated');

        var setSortButtonText = function (sort, direction) {
            vm.sortButtonText = (sort === 'message_type' ? "Message Type" : "Time of Failure") + " " + (direction === 'asc' ? "ASC" : "DESC");
        }

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

        function loadGroupDetails() {
            if (vm.selectedExceptionGroup.initialLoad && vm.selectedExceptionGroup.id) {
                    serviceControlService.getExceptionGroup(vm.selectedExceptionGroup.id).then(function (result) {
                        vm.selectedExceptionGroup.title = result.data.title;
                });
            }
        }

        var init = function() {
            vm.failedMessages = [];
            vm.selectedIds = [];
            vm.page = 1;
            loadGroupDetails();
            setSortButtonText(vm.sort, vm.direction);
            vm.loadMoreResults(vm.selectedExceptionGroup);
        }

        vm.clipComplete = function(messageId) {
            toastService.showInfo(messageId + ' copied to clipboard');
        };

        vm.togglePanel = function (message, panelnum) {
            if (!angular.isDefined(message.messageBody)) {
                serviceControlService.getMessageBody(message.message_id).then(function (msg) {
                    message.messageBody = msg.data;
                }, function () {
                    message.bodyUnavailable = "message body unavailable";
                });
            }

            if (!angular.isDefined(message.messageHeaders)) {
                serviceControlService.getMessageHeaders(message.message_id).then(function (msg) {
                    message.messageHeaders = msg.data[0].headers;
                }, function () {
                    message.headersUnavailable = "message headers unavailable";
                });
            }
            message.panel = panelnum;
            return false;
        };

        vm.selectRow = (row, value) => {

            row.selected = value;
            vm.updateSelectedIdsWithMessage(row);
        };

        vm.selectWithShift = (row, index) => {
            var selectFromIndex = Math.min(index, vm.lastSelectedIndex);
            var selectToIndex = Math.max(index, vm.lastSelectedIndex);

            for (var i = selectFromIndex; i <= selectToIndex; i++) {

                var selected = vm.lastAction === selectActions.Selection ? true : false;
                var r = vm.failedMessages[i];

                vm.selectRow(r, selected);
            }

            vm.lastSelectedIndex = selectToIndex;

            if (vm.selectedIds.length === 0) {
                vm.lastSelectedIndex = -1;
            }

            //Removes text selection that happens 
            //due to shift key being down.
            document.getSelection().removeAllRanges();
        };

        vm.selectSingleRow = (row, index) => {
            var selected = !row.selected;
            vm.selectRow(row, selected);

            if (selected) {
                vm.lastAction = selectActions.Selection;
            } else {
                vm.lastAction = selectActions.Deselection;
            }

            vm.lastSelectedIndex = index;

            if (vm.selectedIds.length === 0) {
                vm.lastSelectedIndex = -1;
            }
        }

        vm.toggleRowSelect = function (row, event, index) {

            if (event.shiftKey && vm.lastSelectedIndex > -1) {
                vm.selectWithShift(row, index);
            } else {
                vm.selectSingleRow(row, index);
            }

            //Stop event propagation since 
            //there are nested elements
            if (event.stopPropagation) event.stopPropagation();
            if (event.preventDefault) event.preventDefault();
            event.cancelBubble = true;
            event.returnValue = false;
        };
         
        vm.updateSelectedIdsWithMessage = function(row) {
            if (row.selected) {
                vm.selectedIds.push(row.id);
            } else {
                vm.selectedIds.splice(vm.selectedIds.indexOf(row.id), 1);
            }
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
        }

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
        }

        var selectGroupInternal = function (group, sort, direction, changeToMessagesTab) {
            if ($scope.loadingData) {
                return;
            }

            vm.sort = sort;
            vm.direction = direction;
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