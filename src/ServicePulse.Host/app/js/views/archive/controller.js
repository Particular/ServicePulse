;
(function (window, angular, undefined) {
    "use strict";

    function createWorkflowState(optionalStatus, optionalMessage, optionalTotal, optionalCount) {
        return {
            status: optionalStatus || 'working',
            message: optionalMessage || 'working',
            total: optionalTotal || 0,
            count: optionalCount || 0
        };
    }

    function controller(
        $scope,
        $timeout,
        $interval,
        $location,
        sharedDataService,
        notifyService,
        serviceControlService,
        archivedMessageService) {

        var vm = this;
        var notifier = notifyService();

        vm.loadingData = false;
        vm.archives = [];

    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$interval",
        "$location",
        "sharedDataService",
        "notifyService",
        "serviceControlService",
        "archivedMessageService"
    ];

    angular.module("sc")
        .controller("archivedMessageController", controller);

})(window, window.angular);