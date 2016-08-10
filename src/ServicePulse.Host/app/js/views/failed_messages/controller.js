;
(function(window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $timeout,
        $location,
        scConfig,
        toastService,
        sharedDataService,
        notifyService,
        serviceControlService,
        failedMessageGroupsService) {

        var vm = this;

        var notifier = notifyService();
        vm.selectedExceptionGroup = sharedDataService.get();

        if (!vm.selectedExceptionGroup) {
            vm.selectedExceptionGroup = { 'id': undefined, 'title': 'All Failed Messages', 'count': 0, 'initialLoad': true };
        }

        if (!vm.selectedExceptionGroup.hasOwnProperty('title')) {
            $location.path('/failedGroups');
        }

        vm.stats = sharedDataService.getstats();
        vm.failedMessages = [];
        vm.selectedIds = [];
        vm.sortButtonText = '';
        vm.sort = "time_of_failure";
        vm.direction = "desc";
        vm.allMessagesLoaded = false;
        vm.loadingData = false;
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

        var init = function() {
            vm.failedMessages = [];
            vm.selectedIds = [];
            vm.page = 1;
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

        vm.toggleRowSelect = function (row) {

            row.selected = !row.selected;

            if (row.selected) {
                vm.selectedIds.push(row.id);
            } else {
                vm.selectedIds.splice(vm.selectedIds.indexOf(row.id), 1);
            }
        };

        vm.retrySelected = function () {
            serviceControlService.retryFailedMessages(vm.selectedIds);
            toastService.showInfo("Retrying " + vm.selectedIds.length + " messages...");
            vm.selectedIds = [];

            vm.failedMessages = vm.failedMessages.filter(function(item) {
                return !item.selected;
            });
        };

        vm.archiveSelected = function () {
            serviceControlService.archiveFailedMessages(vm.selectedIds);
            toastService.showInfo("Archiving " + vm.selectedIds.length + " messages...");
            vm.selectedIds = [];

            vm.failedMessages = vm.failedMessages.filter(function (item) {
                return !item.selected;
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
        
        vm.debugInServiceInsight = function (index) {
            var messageId = vm.failedMessages[index].message_id;
            var dnsName = scConfig.service_control_url.toLowerCase();

            if (dnsName.indexOf("https") === 0) {
                dnsName = dnsName.replace("https://", "");
            } else {
                dnsName = dnsName.replace("http://", "");
            }

            $window.open("si://" + dnsName + "?search=" + messageId);
        };

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

            loadPromise.then(function(response) {
                processLoadedMessages(response.data);
            });
        };

        init();
    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$location",
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