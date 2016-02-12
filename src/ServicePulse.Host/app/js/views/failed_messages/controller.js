;
(function(window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $timeout,
        $location,
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


        vm.togglePanel = function (message, panelnum) {
            if (message.messageBody === undefined) {
                serviceControlService.getMessageBody(message.message_id).then(function (msg) {
                    msg.messageBody = msg.data;
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

        vm.loadMoreResults(vm.group);
    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$location",
        "sharedDataService",
        "notifyService",
        "serviceControlService",
        "failedMessagesService"
    ];

    angular.module("sc")
        .controller("failedMessagesController", controller);

})(window, window.angular);