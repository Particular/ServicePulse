;
(function(window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $timeout,
        $location,
        $moment,
        scConfig,
        toastService,
        sharedDataService,
        notifyService,
        serviceControlService,
        endpointsService) {

        var vm = this;

        var notifier = notifyService();
        
        vm.sortButtonText = '';
        vm.sortDirection = 'asc';
        vm.allMessagesLoaded = false;
        vm.loadingData = false;
        vm.allSelected = false;

        vm.timeGroup = {
            amount: 2,
            unit: 'hours',
            buttonText: 'Retried in the last 2 Hours',
            selected: function () {
                return $moment.duration(vm.timeGroup.amount, vm.timeGroup.unit);;
            }
        };

        notifier.subscribe($scope, function (event, data) {
            if (vm.total !== data) {
                vm.total = data;
                vm.loadMoreResults();
            } 
        }, 'PendingRetriesTotalUpdated');

        notifier.subscribe($scope, function (event, data) {
            vm.endpoints = data;
        }, 'EndpointsUpdated');

        var setSortButtonText = function (sort, direction) {
            vm.sortButtonText = (sort === 'message_type' ? "Message Type" : "Time of Failure");
            vm.sortDirection = direction;
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
            vm.filter = {
                searchPhrase: ''
            };
            vm.filter.start = $moment.utc().subtract(vm.timeGroup.amount, vm.timeGroup.unit).format('YYYY-MM-DDTHH:mm:ss');
            vm.filter.end = $moment.utc().format('YYYY-MM-DDTHH:mm:ss');
            vm.total = sharedDataService.getstats().number_of_pending_retries;
            vm.sort = "time_of_failure";
            vm.direction = "asc";
            setSortButtonText(vm.sort, vm.direction);
            vm.loadMoreResults();
            vm.endpoints = endpointsService.getQueueNames();
        }

        vm.clipComplete = function(messageId) {
            toastService.showInfo(messageId + ' copied to clipboard');
        };

        vm.togglePanel = function (message, panelnum) {
            if (angular.isDefined(message.messageBody)) {
                serviceControlService.getMessageBody(message.message_id).then(function (msg) {
                    message.messageBody = msg.data;
                }, function () {
                    message.bodyUnavailable = "message body unavailable";
                });
            }

            if (angular.isDefined(message.messageHeaders)) {
                serviceControlService.getMessageHeaders(message.message_id).then(function (msg) {
                    message.messageHeaders = msg.data[0].headers;
                }, function () {
                    message.headersUnavailable = "message headers unavailable";
                });
            }
            message.panel = panelnum;
            return false;
        };

        vm.toggleSelectAll = function () {
            vm.pendingRetryMessages.filter(function (item) {
                return item.selected !== vm.allSelected;
            }).forEach(function (item) {
                toggleSelect(item);
            });
        };

        function toggleSelect(row) {
            if (row.retried || row.archived || row.resolved) {
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

            vm.pendingRetryMessages.filter(function (item) {
                return item.selected;
            }).forEach(function (item) {
                item.selected = false;
                item.retried = true;
            });
        };

        vm.markAsResolvedSelected = function () {
            serviceControlService.markAsResolvedMessages(vm.selectedIds);
            vm.selectedIds = [];

            vm.pendingRetryMessages.filter(function (item) {
                return item.selected;
            }).forEach(function (item) {
                item.selected = false;
                item.resolved = true;
            });
        };

        vm.archiveSelected = function () {
            serviceControlService.archiveFailedMessages(vm.selectedIds);
            vm.selectedIds = [];

            vm.pendingRetryMessages.filter(function (item) {
                return item.selected;
            }).forEach(function (item) {
                item.selected = false;
                item.archived = true;
            });
        };

        vm.searchPhraseChanged = function() {
            if (!vm.filter.searchPhrase) {
                vm.pendingRetryMessages = [];
                vm.page = 1;
                vm.loadMoreResults();
            }
        };

        vm.clearSearchPhrase = function() {
            vm.filter.searchPhrase = '';
        }

        vm.onSelect = function() {
            vm.pendingRetryMessages = [];
            vm.page = 1;
            vm.loadMoreResults();
        };

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

        var selectGroupInternal = function (sort, direction) {
            if ($scope.loadingData) {
                return;
            }

            vm.sort = sort || vm.sort;
            vm.direction = direction || vm.direction;
            setSortButtonText(sort, direction);

            vm.pendingRetryMessages = [];
            vm.allMessagesLoaded = false;
            vm.page = 1;

            vm.loadMoreResults(sort, direction);
        };

        vm.selectGroup = function (sort, direction) {
            selectGroupInternal(sort, direction);
        };

        vm.selectTimeGroup = function (amount, unit) {
            vm.timeGroup.amount = amount;
            vm.timeGroup.unit = unit;

            if (amount && unit) {

                switch (amount) {
                    case '2':
                        vm.timeGroup.buttonText = 'Retried in the last 2 Hours';
                        break;
                    case '1':
                        vm.timeGroup.buttonText = 'Retried in the last 1 Day';
                        break;
                    case '7':
                        vm.timeGroup.buttonText = 'Retried in the last 7 Days';
                        break;
                    default:
                        vm.timeGroup.buttonText = amount + ' ' + unit;
                        break;
                }
                vm.filter.start = $moment.utc().subtract(amount, unit).format('YYYY-MM-DDTHH:mm:ss');
                vm.filter.end = $moment.utc().format('YYYY-MM-DDTHH:mm:ss');
            } else {
                vm.timeGroup.buttonText = 'All Pending Retries';
                vm.filter.start = vm.filter.end = undefined;
            }
            selectGroupInternal();
        }

        vm.loadMoreResults = function() {
            vm.allMessagesLoaded = vm.pendingRetryMessages.length >= vm.total;

            if (vm.allMessagesLoaded || vm.loadingData) {
                return;
            }

            vm.loadingData = true;

            serviceControlService.getPendingRetryMessages(vm.filter.searchPhrase || '', vm.sort, vm.page, vm.direction, vm.filter.start, vm.filter.end).then(function (response) {
                processLoadedMessages(response.data);
            });
        };

        init();
    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$location",
        "$moment",
        "scConfig",
        "toastService",
        "sharedDataService",
        "notifyService",
        "serviceControlService",
        "endpointsService"
    ];

    angular.module("sc")
        .controller("pendingRetriesController", controller);

})(window, window.angular);