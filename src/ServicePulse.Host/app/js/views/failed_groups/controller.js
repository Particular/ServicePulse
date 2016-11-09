;
(function (window, angular, undefined) {
    "use strict";

    function createWorkflowState(optionalStatus, optionalMessage, optionalTotal) {
        if (optionalTotal && optionalTotal <= 1) {
            optionalTotal = optionalTotal * 100;
        }
        return {
        status: optionalStatus || 'working',
            message: optionalMessage || 'working',
            total: optionalTotal || 0
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
        vm.allFailedMessagesGroup = { 'id': undefined, 'title': 'All Failed Messages' }
        vm.stats = sharedDataService.getstats();

        vm.viewExceptionGroup = function (group) {
            sharedDataService.set(group);
            $location.path('/failedMessages');
        }
        
        vm.archiveExceptionGroup = function (group) {
            group.workflow_state = { status: 'waiting', message: getMessageForRetryStatus('waiting') };
            failedMessageGroupsService.archiveGroup(group.id, 'Archive Group Request Enqueued', 'Archive Group Request Rejected')
                .then(function (message) {
                    group.workflow_state = createWorkflowState('success', 'Starting operation...');
                    notifier.notify('ArchiveGroupRequestAccepted', group);

                }, function (message) {
                    group.workflow_state = createWorkflowState('error', message);
                    notifier.notify('ArchiveGroupRequestRejected', group);
                });
        }

        vm.retryExceptionGroup = function (group) {
            group.workflow_state = { status: 'waiting', message: getMessageForRetryStatus('waiting') };

            failedMessageGroupsService.retryGroup(group.id, 'Retry Group Request Enqueued', 'Retry Group Request Rejected')
                .then(function () {
                    // We are going to have to wait for service control to tell us the job has been done
                    notifier.notify('RetryGroupRequestAccepted', group);

                }, function (message) {
                    group.workflow_state = createWorkflowState('error', message);
                    notifier.notify('RetryGroupRequestRejected', group);
                });
        }

        vm.closeStatus = function(group) {
            group.workflow_state = createWorkflowState('none');
        }

        vm.canBeRetried = function(group) {
            return group.workflow_state.status === 'none' || group.workflow_state.status === 'completed';
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
                    vm.initialLoadComplete = true;

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
                            var retryStatus = (nObj.retry_status ? nObj.retry_status.toLowerCase() : null) ||
                                'none';
                            nObj
                                .workflow_state =
                                createWorkflowState(retryStatus,
                                    getMessageForRetryStatus(retryStatus),
                                    nObj.retry_progress);
                            
                            return nObj;
                        });

                        if (vm.exceptionGroups.length !== vm.stats.number_of_exception_groups) {
                            vm.stats.number_of_exception_groups = vm.exceptionGroups.length;
                            notifier.notify('ExceptionGroupCountUpdated', vm.stats.number_of_exception_groups);
                        }
                    }
                    return true;
                });
        };

        var getHistoricGroups = function() {
            vm.historicGroups = [];
            serviceControlService.getHistoricGroups()
                .then(function(response) {
                    vm.historicGroups = response.data.previous_fully_completed_operations;
                });
        };

        function getMessageForRetryStatus(retryStatus) {
            if (retryStatus === 'waiting') {
                return 'Starting...';
            }

            if (retryStatus === 'preparing') {
                return 'Step 1/2 - Preparing messages...';
            }
        
            if (retryStatus === 'forwarding') {
                return 'Step 2/2 - Sending messages to retry...';
            }

            if (retryStatus === 'completed') {
                return 'Messages successfully submitted for retrying';
            }

            return '';
        }

        var localtimeout;
        var startTimer = function (time) {
            time = time || 5000;
            localtimeout = $timeout(function () {
                vm.loadingData = true;

                getHistoricGroups();
                autoGetExceptionGroups().then(function (result) {
                    vm.loadingData = false;
                });
            }, time);
        }

        $scope.$on("$destroy", function (event) {
            $timeout.cancel(localtimeout);
        });

        notifier.subscribe($scope, function (event, data) {
            if (vm.exceptionGroups.length !== parseInt(data)) {
                autoGetExceptionGroups();
                getHistoricGroups();
            }
        }, "ExceptionGroupCountUpdated");

        notifier.subscribe($scope, function (event, data) {
            $timeout.cancel(localtimeout);
            startTimer();
        }, 'MessagesSubmittedForRetry');
        
        notifier.subscribe($scope, function (event, data) {
            $timeout.cancel(localtimeout);
            startTimer();
        }, 'FailedMessageGroupArchived');

        notifier.subscribe($scope, function (event, data) {
            vm.exceptionGroups.filter(function (item) { return item.id === data.request_id })
                .forEach(function(item) {
                    item.workflow_state = createWorkflowState('waiting', getMessageForRetryStatus('waiting'), data.progression);
                });
        }, 'RetryOperationWaiting');

        notifier.subscribe($scope, function (event, data) {
            vm.exceptionGroups.filter(function (item) { return item.id === data.request_id })
                .forEach(function (item) {
                    item.workflow_state = createWorkflowState('preparing', getMessageForRetryStatus('preparing'), data.progression);
                });
        }, 'RetryOperationPreparing');

        notifier.subscribe($scope, function (event, data) {
            vm.exceptionGroups.filter(function (item) { return item.id === data.request_id })
                .forEach(function (item) {
                    item.workflow_state = createWorkflowState('forwarding', getMessageForRetryStatus('forwarding'), data.progression);
                });
        }, 'RetryOperationForwarding');

        notifier.subscribe($scope, function (event, data) {
            vm.exceptionGroups.filter(function(item) { return item.id === data.request_id })
                .forEach(function (item) {
                    item.workflow_state = createWorkflowState('completed', getMessageForRetryStatus('completed'), data.progression);
                });
        }, 'RetryOperationCompleted');

        // INIT
        initialLoad();
        getHistoricGroups();
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