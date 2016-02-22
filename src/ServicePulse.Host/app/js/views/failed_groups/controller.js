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
        failedMessageGroupsService) {

        var vm = this;
        var notifier = notifyService();

        vm.exceptionGroups = [];
        vm.selectedExceptionGroup = {};
        vm.allFailedMessagesGroup = { 'id': undefined, 'title': 'All Failed Messages', 'count': 0 }


        var markMessage = function (group, property) {
            //mark messages as retried
            if ($scope.selectedExceptionGroup && group.id === $scope.selectedExceptionGroup.id) {
                for (var i = 0; i < $scope.model.failedMessages.length; i++) {
                    $scope.model.failedMessages[i][property] = true;
                }
            }
        };

        vm.viewExceptionGroup = function (group) {
            sharedDataService.set(group);
            $location.path('/failedMessages');
        }

        vm.archiveExceptionGroup = function (group) {

            group.workflow_state = { status: 'working', message: 'working' };
            var response = failedMessageGroupsService.archiveGroup(group.id, 'Archive Group Request Enqueued', 'Archive Group Request Rejected')
                .then(function (message) {

                    group.workflow_state = createWorkflowState('success', message);

                    markMessage(group, 'archived');

                    notifier.notify('ArchiveGroupRequestAccepted', group);

                }, function (message) {
                    group.workflow_state = createWorkflowState('error', message);
                    notifier.notify('ArchiveGroupRequestRejected', group);

                })
                .finally(function () {

                });
        }

        vm.retryExceptionGroup = function (group) {
            group.workflow_state = { status: 'working', message: 'working' };

            var response = failedMessageGroupsService.retryGroup(group.id, 'Retry Group Request Enqueued', 'Retry Group Request Rejected')
                .then(function (message) {
                    // We are going to have to wait for service control to tell us the job has been done
                    group.workflow_state = createWorkflowState('success', message);
                    markMessage(group, 'retried');
                    notifier.notify('RetryGroupRequestAccepted', group);

                }, function (message) {
                    group.workflow_state = createWorkflowState('error', message);
                    notifier.notify('RetryGroupRequestRejected', group);

                })
                .finally(function () {

                });
        }

        var removeGroup = function (group) {
            //remove group
            for (var j = 0; j < $scope.model.exceptionGroups.length; j++) {
                var exGroup = $scope.model.exceptionGroups[j];
                if (group.title === exGroup.title) {
                    $scope.model.exceptionGroups.splice(j, 1);
                }
            }
        };

        var autoGetExceptionGroups = function () {

            serviceControlService.getExceptionGroups()
                .then(function (response) {
                    if (response.data.length > 0) {

                        vm.allFailedMessagesGroup.count = 0;

                        // need a map in some ui state for controlling animations
                        vm.exceptionGroups = response.data.map(function (obj) {
                            vm.allFailedMessagesGroup.count += obj.count;
                            var nObj = obj;
                            nObj.workflow_state = createWorkflowState('ready', '');
                            return nObj;
                        });
                    }
                });

        };

        notifier.subscribe($scope, function (event, data) {
            $timeout(function () {
                autoGetExceptionGroups();
            }, 5000);
        }, 'MessagesSubmittedForRetry');

        // INIT
        autoGetExceptionGroups();
    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$interval",
        "$location",
        "sharedDataService",
        "notifyService",
        "serviceControlService",
        "failedMessageGroupsService"
    ];

    angular.module("sc")
        .controller("failedMessageGroupsController", controller);

})(window, window.angular);