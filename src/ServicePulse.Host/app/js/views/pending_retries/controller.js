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
        serviceControlService) {

        var vm = this;

        var notifier = notifyService();

        vm.pendingRetryMessages = [];
        vm.selectedIds = [];
        vm.sortButtonText = '';
        vm.sort = "time_of_failure";
        vm.direction = "desc";
        vm.allMessagesLoaded = false;
        vm.loadingData = false;
        vm.page = 1;
        vm.total = 0;
        vm.searchPhrase = '';
        vm.allSelected = false;

        notifier.subscribe($scope, function (event, data) {
            if (vm.total !== data) {
                vm.total = data;
                vm.loadMoreResults();
            } 
        }, 'PendingRetriesTotalUpdated');

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

                vm.pendingRetryMessages = vm.pendingRetryMessages.concat(exgroups);
                vm.allMessagesLoaded = (vm.pendingRetryMessages.length >= vm.total);
                vm.page++;
            }
            vm.loadingData = false;
        };

        var init = function() {
            vm.pendingRetryMessages = [];
            vm.selectedIds = [];
            vm.page = 1;
            vm.total = sharedDataService.getstats().number_of_pending_retries;
            setSortButtonText(vm.sort, vm.direction);
            vm.loadMoreResults();
        }

        vm.getAvailableEndpoints = function (searchPhrase) {
            if (searchPhrase.length < 3)
                return;
            return serviceControlService.getQueueNames(searchPhrase).then(function(results) {
                return results.map(function(item) {
                    return item.physical_address;
                });
            });
        };

        vm.clipComplete = function (messageId)
        {
            toastService.showInfo(messageId + ' copied to clipboard');
        }

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

        vm.toggleSelectAll = function() {
            for (var i = 0; i < vm.pendingRetryMessages.length; i++) {
                if (vm.pendingRetryMessages[i].selected !== vm.allSelected) {
                    toggleSelect(vm.pendingRetryMessages[i]);
                }
            }
        };

        function toggleSelect(row) {
            if (row.retried || row.archived) {
                return;
            }

            row.selected = !row.selected;

            if (row.selected) {
                vm.selectedIds.push(row.id);
            } else {
                vm.selectedIds.splice(vm.selectedIds.indexOf(row.id), 1);
            }
        }

        vm.toggleRowSelect = function (row) {
            toggleSelect(row);

            vm.allSelected = vm.selectedIds.length === vm.pendingRetryMessages.length;
        };

        vm.retrySelected = function () {
            serviceControlService.retryFailedMessages(vm.selectedIds);
            vm.selectedIds = [];

            for (var i = 0; i < vm.pendingRetryMessages.length; i++) {
                if (vm.pendingRetryMessages[i].selected) {
                    vm.pendingRetryMessages[i].selected = false;
                    vm.pendingRetryMessages[i].retried = true;
                }
            }
        };

        vm.markAsResolvedSelected = function () {
            serviceControlService.markAsResolvedMessages(vm.selectedIds);
            vm.selectedIds = [];

            for (var i = 0; i < vm.pendingRetryMessages.length; i++) {
                if (vm.pendingRetryMessages[i].selected) {
                    vm.pendingRetryMessages[i].selected = false;
                    vm.pendingRetryMessages[i].resolved = true;
                }
            }
        };

        vm.archiveSelected = function () {
            serviceControlService.archiveFailedMessages(vm.selectedIds);
            vm.selectedIds = [];

            for (var i = 0; i < vm.pendingRetryMessages.length; i++) {
                if (vm.pendingRetryMessages[i].selected) {
                    vm.pendingRetryMessages[i].selected = false;
                    vm.pendingRetryMessages[i].archived = true;
                }
            }
        };

        vm.searchPhraseChanged = function() {
            if (!vm.searchPhrase) {
                vm.pendingRetryMessages = [];
                vm.page = 1;
                vm.loadMoreResults();
            }
        }

        vm.onSelect = function () {
            vm.pendingRetryMessages = [];
            vm.page = 1;
            vm.loadMoreResults();
        }

        vm.debugInServiceInsight = function (index) {
            var messageId = vm.pendingRetryMessages[index].message_id;
            var dnsName = scConfig.service_control_url.toLowerCase();

            if (dnsName.indexOf("https") === 0) {
                dnsName = dnsName.replace("https://", "");
            } else {
                dnsName = dnsName.replace("http://", "");
            }

            $window.open("si://" + dnsName + "?search=" + messageId);
        };

        var selectGroupInternal = function (sort, direction, changeToMessagesTab) {
            vm.sort = sort;
            vm.direction = direction;
            setSortButtonText(sort, direction);

            if ($scope.loadingData) {
                return;
            }

            if (changeToMessagesTab) {
                vm.activePageTab = "messages";
            }

            vm.pendingRetryMessages = [];
            vm.allMessagesLoaded = false;
            vm.page = 1;

            vm.loadMoreResults(sort, direction);
        };

        vm.selectGroup = function (sort, direction) {
            selectGroupInternal(sort, direction, true);
        };

        vm.loadMoreResults = function () {
            vm.allMessagesLoaded = vm.pendingRetryMessages.length >= vm.total;

            if (vm.allMessagesLoaded || vm.loadingData) {
                return;
            }

            vm.loadingData = true;
            
            serviceControlService.getPendingRetryMessages(vm.searchPhrase || '', vm.sort, vm.page, vm.direction).then(function (response) {
                processLoadedMessages(response.data);
            });
        }

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
        "serviceControlService"
    ];

    angular.module("sc")
        .controller("pendingRetriesController", controller);

})(window, window.angular);