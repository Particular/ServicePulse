(function(window, angular) {
    "use strict";

    function controller(
        $scope,
        $rootScope,
        $location,
        $routeParams,
        $cookies,
        toastService,
        sharedDataService,
        notifyService,
        serviceControlService,
        failedMessageGroupsService,
        $jquery,
        exportToFile) {

        serviceControlService.performingDataLoadInitially = true;

        var vm = this;
        var notifier = notifyService();

        vm.selectedExceptionGroup = { 'id': $routeParams.groupId ? $routeParams.groupId : undefined, 'title': 'All Failed Messages', 'count': 0, 'initialLoad': true };

        if (!Object.prototype.hasOwnProperty.call(vm.selectedExceptionGroup, 'title')) {
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
        vm.loadingData = false;
        vm.lastAction = selectActions.Selection;
        vm.pager = {
            page: 1,
            total: parseInt(vm.stats.number_of_failed_messages),
            perPage: 50
        }
        // vm.page = 1;
        // vm.total = parseInt(vm.stats.number_of_failed_messages);

        notifier.subscribe($scope, function (event, data) {
            vm.pager.total = parseInt(data);
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
                vm.selectedIds = [];
                vm.failedMessages = exgroups;
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
            vm.pager.page = 1;
            vm.sort = defaultSort.sort;
            vm.direction = defaultSort.direction;

            loadGroupDetails();
            setSortButtonText(vm.sort, vm.direction);
            vm.loadMoreResults(vm.selectedExceptionGroup);
        };

        vm.viewMessage = function (message) {
            $location.path("/failed-messages/message/" + message.id);
        };

        vm.selectAllMessages = function() {
            var selectAll = true;
            if(vm.selectedIds.length > 0) {
                selectAll = false;
            }
            vm.selectedIds = [];
            vm.failedMessages.forEach(function(item) {
                if (selectAll) {
                    item.selected = true;
                    vm.selectedIds.push(item.id);
                } else {
                    item.selected = false;
                }
            });
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

        vm.exportSelected = function () {
            var messagesForExport = vm.failedMessages.filter(function(item) {
                return item.selected;
            });

            var propertiesToSkip = ["hover", "selected", "hover2", "$$hashKey", "panel", "edit_of", "edited"];

            var preparedMessagesForExport = [];
            for (var i = 0; i < messagesForExport.length; i++) {
                preparedMessagesForExport[preparedMessagesForExport.length] = parseObject(messagesForExport[i], propertiesToSkip);
            }

            var csvStr = $jquery.csv.fromObjects(preparedMessagesForExport);
            exportToFile.downloadString(csvStr, "text/csv", "failedMessages.csv");
            toastService.showInfo("Messages export completed.");
        };

        function parseObject(obj, propertiesToSkip, path) {
            if (path == undefined) path = "";

            var type = $jquery.type(obj);
            var d = {};

            if (type == "array" || type == "object") {
                for (var i in obj) {
                    var newD = parseObject(obj[i], propertiesToSkip, path + i + ".");
                    $jquery.extend(d, newD);
                }
                return d;
            }else if (type == "number" || type == "string" || type == "boolean" || type == "null") {
                var endPath = path.substr(0, path.length - 1);
                if (propertiesToSkip && propertiesToSkip.includes(endPath)) {
                    return d;
                }
                d[endPath] = obj;
                return d;
            }
            return d;
        }

        vm.archiveSelected = function () {
            toastService.showInfo("Deleting " + vm.selectedIds.length + " messages...");
            serviceControlService.archiveFailedMessages(vm.selectedIds)
                .then(function () {
                    vm.selectedIds = [];

                    vm.failedMessages = vm.failedMessages.filter(function(item) {
                        return !item.selected;
                    });

                    $scope.$emit("list:updated");
                });
        };

        vm.archiveExceptionGroup = function (group) {
            failedMessageGroupsService.archiveGroup(group.id, 'Delete group request enqueued', 'Delete group request rejected')
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
            vm.pager.page = 1;

            vm.loadMoreResults(group, sort, direction);
        };

        vm.selectGroup = function (group, sort, direction) {
            selectGroupInternal(group, sort, direction, true);
        };

        vm.loadMoreResults = function(group) {

            if (vm.loadingData) {
                return;
            }

            vm.loadingData = true;

            var allExceptionsGroupSelected = (!group || !group.id);

            var loadPromise;
            if (allExceptionsGroupSelected) {
                loadPromise = serviceControlService.getFailedMessages(vm.sort, vm.pager.page, vm.direction);
            } else {
                loadPromise = serviceControlService.getFailedMessagesForExceptionGroup(group.id, vm.sort, vm.pager.page, vm.direction);
            }

            loadPromise.then(function (response) {
                if (group.count === 0) {
                    group.count = response.total;
                }

                vm.pager.total = parseInt(response.total);
                processLoadedMessages(response.data);

                if (group.initialLoad) {
                    notifier.notify('InitialLoadComplete');
                }

                delete group.initialLoad;
            });
        };

        init();
    }

    controller.$inject = [
        '$scope',
        '$rootScope',
        '$location',
        '$routeParams',
        '$cookies',
        'toastService',
        'sharedDataService',
        'notifyService',
        'serviceControlService',
        'failedMessageGroupsService',
        '$jquery',
        'exportToFile'
    ];

    angular.module('sc')
        .controller('failedMessagesController', controller);
}(window, window.angular));
