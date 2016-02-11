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
        $location,
        sharedDataService,
        notifyService,
        serviceControlService,
        failedMessageGroupsService) {

        var vm = this;
        var notifier = notifyService();

        vm.exceptionGroups = [];
        vm.selectedExceptionGroup = {};

        vm.viewExceptionGroup = function (group) {
            sharedDataService.set(group);
            $location.path('/failedMessages'); 
        }

        vm.archiveExceptionGroup = function (group) { }
        vm.retryExceptionGroup = function(group) {
            group.workflow_state = { status: 'working', message: 'working' };

            var response = failedMessageGroupsService.retryGroup(group.id, 'Retry Group Request Enqueued', 'Retry Group Request Rejected')
                .then(function (message) {
                    // We are going to have to wait for service control to tell us the job has been done
                    group.workflow_state = createWorkflowState('success', message);

                    markMessage(group, 'retried');
                    //selectGroupInternal($scope.allFailedMessagesGroup, null, false);

                }, function (message) {
                    group.workflow_state = createWorkflowState('error', message);
                })
                .finally(function () {

                });
        }

        var autoGetExceptionGroups = function () {
            serviceControlService.getExceptionGroups()
                .then(function (response) {
                    if (response.data.length > 0) {
                        // need a map in some ui state for controlling animations
                        var exgroups = response.data.map(function (obj) {
                            var nObj = obj;
                            nObj.workflow_state = createWorkflowState('ready', '');
                            return nObj;
                        });

                        vm.exceptionGroups = exgroups;

                        return;
                    }

                    $timeout(function () {
                        autoGetExceptionGroups();
                    }, 2000);
                });
        };

        // INIT
        autoGetExceptionGroups();
    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$location",
        "sharedDataService",
        "notifyService",
        "serviceControlService",
        "failedMessageGroupsService"
    ];

    angular.module("sc")
        .controller("failedMessageGroupsController", controller);

})(window, window.angular);