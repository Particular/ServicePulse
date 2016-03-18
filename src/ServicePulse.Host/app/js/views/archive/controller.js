;
(function(window, angular, undefined) {
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
        $moment,
        sharedDataService,
        notifyService,
        archivedMessageService) {

        var vm = this;
        var notifier = notifyService();

 
        vm.sortButtonText = '';
        vm.sort = "time_sent";
        vm.direction = "desc";
        vm.allMessagesLoaded = false;
        vm.loadingData = false;
        vm.startRange = new Date($moment());
        vm.endrange = new Date($moment().add(3, 'hours'));
        vm.page = 1;
        vm.archives = [{}];
        vm.error_retention_period = $moment.duration("10.00:00:00").asHours();

        var setSortButtonText = function (sort, direction) {
            vm.sortButtonText = (sort === 'message_type' ? "Message Type" : "Time Sent") + " " + (direction === 'asc' ? "ASC" : "DESC");
        }

        var processLoadedMessages = function (data) {
    
            if (data && data.length > 0) {
                var exgroups = data.map(function(obj) {
                    var nObj = obj;
                    nObj.panel = 0;
                    nObj.deleted_in = $moment(nObj.last_modified).add(vm.error_retention_period, 'hours').format();
                    return nObj;
                });

                vm.archives = vm.archives.concat(exgroups);
                vm.allMessagesLoaded = (vm.archives.length >= vm.total);
                vm.page++;
            }
           
            vm.loadingData = false;
        };

        var init = function () {

            vm.configuration = sharedDataService.getConfiguration();
            vm.error_retention_period = $moment.duration(vm.configuration.data_retention.error_retention_period).asHours();
            vm.total = 1;
            vm.archives = [];
            vm.page = 1;
            setSortButtonText(vm.sort, vm.direction);
            vm.loadMoreResults();
        }

        vm.loadMoreResults = function() {
            vm.allMessagesLoaded = vm.archives.length >= vm.total;

            if (vm.allMessagesLoaded || vm.loadingData) {
                return;
            }

            vm.loadingData = true;

            archivedMessageService.getArchivedMessages(
                vm.sort,
                vm.page,
                vm.direction).then(function (response) {
                    vm.total = response.total;
                    processLoadedMessages(response.data);
                });

        }

        init();

    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$interval",
        "$location",
        "$moment",
        "sharedDataService",
        "notifyService",
        "archivedMessageService"
    ];

    angular.module("sc")
        .controller("archivedMessageController", controller);

})(window, window.angular);