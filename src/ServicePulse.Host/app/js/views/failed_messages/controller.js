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
            vm.failedMessages = vm.failedMessages.concat(data);
            vm.allMessagesLoaded = (vm.failedMessages.length >= vm.group.count);
            vm.loadingData = false;
            vm.page++;
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