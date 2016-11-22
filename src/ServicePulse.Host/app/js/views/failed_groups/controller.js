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
       
        vm.loadingData = false;
        vm.exceptionGroups = [];
        vm.availableClassifiers = [];
        vm.selectedExceptionGroup = {};
        vm.allFailedMessagesGroup = { 'id': undefined, 'title': 'All Failed Messages', 'count': 0 }
        vm.stats = sharedDataService.getstats();

        vm.viewExceptionGroup = function (group) {
            sharedDataService.set(group);
            $location.path('/failedMessages');
        }
        
        vm.archiveExceptionGroup = function (group) {
            group.workflow_state = { status: 'working', message: 'working' };
            var response = failedMessageGroupsService.archiveGroup(group.id, 'Archive Group Request Enqueued', 'Archive Group Request Rejected')
                .then(function (message) {
                    group.workflow_state = createWorkflowState('success', message);
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
                    notifier.notify('RetryGroupRequestAccepted', group);

                }, function (message) {
                    group.workflow_state = createWorkflowState('error', message);
                    notifier.notify('RetryGroupRequestRejected', group);
                })
                .finally(function () {

                });
        }

        vm.selectClassification = function (newClassification) {
            vm.loadingData = true;
            vm.selectedClassification = newClassification;

            return autoGetExceptionGroups().then(function (result) {
                vm.loadingData = false;

                return true;
            });
        };

        var initialLoad = function () {
            vm.loadingData = true;

            serviceControlService.getExceptionGroupClassifiers().then(function (classifiers) {
                vm.availableClassifiers = classifiers;
                vm.selectedClassification = classifiers[0];

                autoGetExceptionGroups().then(function (result) {
                    vm.loadingData = false;

                    return true;
                });
            });
        };

        var autoGetExceptionGroups = function () {
            vm.exceptionGroups = [];
            return serviceControlService.getExceptionGroups(vm.selectedClassification)
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

                        vm.stats.number_of_exception_groups = vm.exceptionGroups.length;
                        notifier.notify('ExceptionGroupCountUpdated', vm.stats.number_of_exception_groups);
                    }

                    return true;
                });
        };

        var localtimeout;
        var startTimer = function (time) {
            time = time || 5000;
            localtimeout = $timeout(function () {
                vm.loadingData = true;

                autoGetExceptionGroups().then(function (result) {
                    vm.loadingData = false;
                });
            }, time);
        }

        $scope.$on("$destroy", function (event) {
            $timeout.cancel(localtimeout);
        });

        notifier.subscribe($scope, function (event, data) {
            $timeout.cancel(localtimeout);
            startTimer();
        }, 'MessagesSubmittedForRetry');
        
        notifier.subscribe($scope, function (event, data) {
            $timeout.cancel(localtimeout);
            startTimer();
        }, 'FailedMessageGroupArchived');

        // INIT
        initialLoad();
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