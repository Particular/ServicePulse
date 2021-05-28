/// <reference path="service.js" />
(function(window, angular) {
    "use strict";

    function controller(
        $scope,
        $timeout,
        $location,
        moment,
        $filter,
        toastService,
        sharedDataService,
        notifyService,
        serviceControlService,
        endpointsService,
        redirectService,
        pendingRetryService) {

        var vm = this;

        var notifier = notifyService();

        vm.sortButtonText = '';
        vm.sortDirection = 'asc';
        vm.allMessagesLoaded = false;
        vm.loadingData = false;

        vm.timeGroup = {
            amount: undefined,
            unit: undefined,
            buttonText: 'All Pending Retries'
        };

        vm.pager = {
            page: 1,
            total: 1,
            perPage: 50

        };

        notifier.subscribe($scope, function (event, updatedTotalMessages) {
            if (vm.total !== updatedTotalMessages) {
                vm.total = updatedTotalMessages;
                vm.loadTotalBasedOnFilters();
                vm.loadMoreResults();
            }
        }, 'PendingRetriesTotalUpdated');

        notifier.subscribe($scope, function(event, data) {
            vm.endpoints = data;
        }, 'EndpointsUpdated');

        notifier.subscribe($scope, function(event, response) {
            vm.redirects = response.data;
            refreshRedirects();
        }, 'RedirectsUpdated');


        notifier.subscribe($scope, function (event, messagefailed) {
            removeResolvedMessage(messagefailed.failed_message_id);
        }, "MessageFailed");

        notifier.subscribe($scope, function (event, messagefailureResolvedManually) {
            removeResolvedMessage(messagefailureResolvedManually.failed_message_id);
        }, "MessageFailureResolvedManually");

        notifier.subscribe($scope, function (event, messagesSubmittedForRetry) {
            vm.pendingRetryMessages.filter(function(item) {
                return messagesSubmittedForRetry.failed_message_ids.indexOf(item.id) > -1;
            }).forEach(function(item) {
                item.submittedForRetrial = false;
                item.retried = true;
            });
        }, "MessagesSubmittedForRetry");

        notifier.subscribe($scope, function (event, messageFailureResolved) {
            removeResolvedMessage(messageFailureResolved.failed_message_id);
        }, "MessageFailureResolvedByRetry");

        var setSortButtonText = function(sort, direction) {
            vm.sortButtonText = (sort === 'message_type' ? "Message Type" : "Time of Failure");
            vm.sortDirection = direction;
        };

        function removeResolvedMessage(message_id) {
            vm.pendingRetryMessages = vm.pendingRetryMessages.filter(function (item) {
                return item.id !== message_id;
            });
        }

        function refreshRedirects() {
            vm.pendingRetryMessages.forEach(function (obj) {
                var nObj = obj;
                return fillRedirect(nObj);
            });
        }

        function fillRedirect(nObj) {
            var redirectsFound = $filter('filter')(vm.redirects, { from_physical_address: nObj.queue_address }, true);
            if (redirectsFound.length) {
                nObj.redirect = redirectsFound[0];
            } else {
                nObj.redirect = null;
            }
            return nObj;
        }

        var processLoadedMessages = function(data) {
            if (data.length > 0) {
                var exgroups = data.map(function(obj) {
                    var nObj = obj;
                    nObj.panel = 0;

                    return fillRedirect(nObj);
                });

                vm.selectedIds = [];
                vm.pendingRetryMessages = exgroups;
            }
            vm.loadingData = false;
        };

        var init = function() {
            vm.pendingRetryMessages = [];
            vm.selectedIds = [];
            vm.multiselection = {};
            vm.pager.page = 1;
            vm.filter = {
                searchPhrase: undefined
            };
            vm.filter.start = vm.filter.end = undefined;
            vm.total = sharedDataService.getstats().number_of_pending_retries;
            vm.pager.total = vm.total;
            vm.sort = "time_of_failure";
            vm.direction = "asc";
            setSortButtonText(vm.sort, vm.direction);
            vm.loadMoreResults();
            vm.endpoints = endpointsService.getQueueNames();
            redirectService.getRedirects().then(function(redirects) {
                vm.redirects = redirects.data;
            });
        }

        vm.noStatusPresent = function(message) {
            return (!message.submittedForRetrial || !angular.isDefined(message.submittedForRetrial)) &&
                (!message.retried || !angular.isDefined(message.retried)) &&
            (!message.resolved || !angular.isDefined(message.resolved)) && message.number_of_processing_attempts === 1;
        };

        vm.clipComplete = function(messageId) {
            toastService.showInfo(messageId + ' copied to clipboard');
        };

        vm.retrySelected = function () {
            vm.loadingData = true;
            pendingRetryService.retryPendingRetriedMessages(vm.selectedIds).then(function() {
                vm.selectedIds = [];

                vm.pendingRetryMessages.filter(function(item) {
                    return item.selected;
                }).forEach(function(item) {
                    item.selected = false;
                    item.submittedForRetrial = true;
                    item.retried = false;
                });
                toastService.showInfo('Selected messages were submitted for retry.');
                vm.loadingData = false;
            }, function() {
                toastService.showError('Failed to retry selected messages');
                vm.loadingData = false;
            });
        };

        vm.retryAll = function () {
            vm.loadingData = true;
            pendingRetryService.retryAllMessages(vm.filter.searchPhrase.physical_address, vm.filter.start, vm.filter.end).then(function() {
                vm.selectedIds = [];

                vm.pendingRetryMessages.forEach(function(item) {
                    item.selected = false;
                    item.submittedForRetrial = true;
                    item.retried = false;
                });
                toastService.showInfo('All filtered messages were submitted for retry.');
                vm.loadingData = false;
            }, function() {
                toastService.showError('Failed to retry all filtered messages');
                vm.loadingData = false;
            });
        };

        vm.markAsResolvedAll = function () {
            vm.loadingData = true;
            pendingRetryService.markAsResolvedAllMessages(vm.filter.searchPhrase ? vm.filter.searchPhrase.physical_address : '', vm.filter.start, vm.filter.end).then(function() {
                vm.selectedIds = [];

                vm.pendingRetryMessages.forEach(function(item) {
                    item.selected = false;
                    item.resolved = true;
                });
                toastService.showInfo('All filtered messages were marked as resolved.');
                vm.loadingData = false;
            }, function() {
                toastService.showError('Failed to mark as resolved all filtered messages');
                vm.loadingData = false;
            });
        };

        vm.isQueueFilterEmpty = function() {
            return !vm.filter.searchPhrase;
        };

        vm.retryAllConfirmationTitle = function() {
            if (vm.isQueueFilterEmpty()) {
                return "Select a queue first";
            }
        };

        vm.retryAllConfirmationMessage = function() {
            if (!vm.isQueueFilterEmpty()) {
                return "Are you sure you want to retry " + vm.pager.total + " out of " + vm.total + " previously retried messages? If the selected messages were processed in the meanwhile, then duplicate messages will be produced.";
            }

            return "Bulk retry of messages can only be done for one queue at the time to avoid producing unwanted message duplicates.";
        };

        vm.markAsResolvedSelected = function () {
            vm.loadingData = true;
            pendingRetryService.markAsResolvedMessages(vm.selectedIds).then(function() {
                vm.selectedIds = [];

                vm.pendingRetryMessages.filter(function(item) {
                    return item.selected;
                }).forEach(function(item) {
                    item.selected = false;
                    item.resolved = true;
                });
                toastService.showInfo('Selected messages were marked as resolved.');
                vm.loadingData = false;
            }, function() {
                toastService.showError('Failed to mark as resolved selected messages');
                vm.loadingData = false;
            });
        };

        vm.searchPhraseChanged = function() {
            vm.pendingRetryMessages = [];
            vm.pager.page = 1;
            vm.pager.total = 1;
            vm.selectedIds = [];
            vm.multiselection = {};
            vm.pendingRetryMessages.forEach(function (item) {
                item.selected = false;
            });

            vm.loadTotalBasedOnFilters();
            vm.loadMoreResults();
        };

        vm.clearSearchPhrase = function() {
            vm.filter.searchPhrase = undefined;
            vm.searchPhraseChanged();
        };

        vm.onSelect = function() {
            vm.pendingRetryMessages = [];
            vm.pager.page = 1;
            vm.loadMoreResults();
        };

        var selectGroupInternal = function(sort, direction) {
            if ($scope.loadingData) {
                return;
            }

            vm.sort = sort || vm.sort;
            vm.direction = direction || vm.direction;
            setSortButtonText(sort, direction);

            vm.pendingRetryMessages = [];
            vm.pager.page = 1;

            vm.loadTotalBasedOnFilters();
            vm.loadMoreResults(sort, direction);
        };

        vm.selectGroup = function(sort, direction) {
            selectGroupInternal(sort, direction);
        };

        vm.selectTimeGroup = function(amount, unit) {
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
                vm.filter.start = moment.utc().subtract(amount, unit).format('YYYY-MM-DDTHH:mm:ss');
                vm.filter.end = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
            } else {
                vm.timeGroup.buttonText = 'All Pending Retries';
                vm.filter.start = vm.filter.end = undefined;
            }
            selectGroupInternal();
        };

        vm.loadTotalBasedOnFilters = function() {
            pendingRetryService.getTotalPendingRetryMessages(vm.filter.searchPhrase ? vm.filter.searchPhrase.physical_address : '', vm.filter.start, vm.filter.end).then(function(response) {
                vm.pager.total = response.total;
            });
        };

        vm.loadMoreResults = function() {
            if (vm.loadingData) {
                return;
            }

            vm.loadingData = true;

            pendingRetryService.getPendingRetryMessages(vm.filter.searchPhrase ? vm.filter.searchPhrase.physical_address : '', vm.sort, vm.pager.page, vm.direction, vm.filter.start, vm.filter.end).then(function(response) {
                processLoadedMessages(response.data);
            });
        };

        vm.areFiltersSelected = function() {
            return !!(vm.filter.searchPhrase || vm.filter.start || vm.filter.end);
        };

        init();
    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$location",
        "moment",
        "$filter",
        "toastService",
        "sharedDataService",
        "notifyService",
        "serviceControlService",
        "endpointsService",
        "redirectService",
        "pendingRetryService"
    ];

    angular.module("sc")
        .controller("pendingRetriesController", controller);

})(window, window.angular);