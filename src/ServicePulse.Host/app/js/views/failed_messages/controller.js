;
(function(window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $timeout,
        $location,
        scConfig,
        sharedDataService,
        notifyService,
        serviceControlService,
        failedMessagesService) {

        var vm = this;

        vm.group = sharedDataService.get();
        if (!vm.group.hasOwnProperty('title')) {
            $location.path('/failedGroups');
        }

        vm.sort = "time_sent";
        vm.direction = "desc";
        vm.failedMessages = [];
        vm.selectedIds = [];
        vm.sort = "time_sent";
        vm.direction = "desc";
        vm.allMessagesLoaded = false;
        vm.loadingData = false;
        vm.page = 1;



        var processLoadedMessages = function (data) {
            if (data.length > 0) {
                var exgroups = data.map(function(obj) {
                    var nObj = obj;
                    nObj.panel = 0;
                    return nObj;
                });

                vm.failedMessages = vm.failedMessages.concat(exgroups);
                vm.allMessagesLoaded = (vm.failedMessages.length >= vm.group.count);
                vm.page++;
            }
            vm.loadingData = false;
        };

        var init = function() {
            vm.failedMessages = [];
            vm.selectedIds = [];
            vm.page = 1;

            vm.loadMoreResults(vm.group);
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

        vm.toggleRowSelect = function (row) {
            if (row.retried || row.archived) {
                return;
            }

            row.selected = !row.selected;

            if (row.selected) {
                vm.selectedIds.push(row.id);
            } else {
                vm.selectedIds.splice(vm.selectedIds.indexOf(row.id), 1);
            }
        };


        vm.retrySelected = function () {
            serviceControlService.retryFailedMessages(vm.selectedIds);
            vm.selectedIds = [];

            for (var i = 0; i < vm.failedMessages.length; i++) {
                if (vm.failedMessages[i].selected) {
                    vm.failedMessages[i].selected = false;
                    vm.failedMessages[i].retried = true;
                }
            }
        };

        vm.archiveSelected = function () {
            serviceControlService.archiveFailedMessages(vm.selectedIds);
            vm.selectedIds = [];

            for (var i = 0; i < vm.failedMessages.length; i++) {
                if (vm.failedMessages[i].selected) {
                    vm.failedMessages[i].selected = false;
                    vm.failedMessages[i].archived = true;
                }
            }
        };

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


        vm.loadMoreResults = function (group) {
            vm.allMessagesLoaded = vm.failedMessages.length >= group.count;

            if (vm.allMessagesLoaded || vm.loadingData) {
                return;
            }

            vm.loadingData = true;

            serviceControlService.getFailedMessagesForExceptionGroup(
                group.id,
                vm.sort,
                vm.page,
                vm.direction).then(function (response) {
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
        "sharedDataService",
        "notifyService",
        "serviceControlService",
        "failedMessagesService"
    ];

    angular.module("sc")
        .controller("failedMessagesController", controller);

})(window, window.angular);