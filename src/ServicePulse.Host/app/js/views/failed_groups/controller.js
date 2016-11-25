;
(function (window, angular, undefined) {
    "use strict";

    function createWorkflowState(optionalStatus, optionalMessage, optionalTotal, optionalFailed) {
        if (optionalTotal && optionalTotal <= 1) {
            optionalTotal = optionalTotal * 100;
        }
        return {
            status: optionalStatus || 'working',
            message: optionalMessage || 'working',
            total: optionalTotal || 0,
            failed: optionalFailed || false
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
        failedMessageGroupsService,
        toastService) {

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

        vm.isBeingRetried = function(group) {
            return group.workflow_state.status !== 'none' && group.workflow_state.status !== 'completed';
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
                                    getMessageForRetryStatus(retryStatus, false, nObj.retry_progress),
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

        function getMessageForRetryStatus(retryStatus, failed, progress) {
            if (retryStatus === 'waiting') {
                return 'Retry request initiated...';
            }

            if (retryStatus === 'preparing') {
                if (progress && progress === 1) {
                    return 'Retry request in progress. Step 2/2 - Sending messages to retry...waiting for other sending operation(s) to finish.';
                }
                return 'Retry request in progress. Step 1/2 - Preparing messages...';
            }
        
            if (retryStatus === 'forwarding') {
                return 'Retry request in progress. Step 2/2 - Sending messages to retry...';
            }

            if (retryStatus === 'completed') {
                if (failed) {
                    return 'ServiceControl had to restart while this operation was in progress. Not all messages were submitted for retrying.';
                }

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

        var retryOperationEventHandler = function(data, status) {
            vm.exceptionGroups.filter(function(item) { return item.id === data.request_id })
                .forEach(function(item) {
                    item
                        .workflow_state =
                        createWorkflowState(status,
                            getMessageForRetryStatus(status, data.failed || false, data.progress.percentage),
                            data.progress.percentage,
                            data.failed || false);
                    item.retry_remaining_count = data.progress.messages_remaining;
                    item.retry_start_time = data.start_time;
                });
        };

        notifier.subscribe($scope, function (event, data) {
            retryOperationEventHandler(data, 'waiting');
        }, 'RetryOperationWaiting');

        notifier.subscribe($scope, function (event, data) {
            retryOperationEventHandler(data, 'preparing');
        }, 'RetryOperationPreparing');

        notifier.subscribe($scope, function (event, data) {
            retryOperationEventHandler(data, 'forwarding');
        }, 'RetryOperationForwarding');
        
        notifier.subscribe($scope, function (event, data) {
            retryOperationEventHandler(data, 'forwarding');
        }, 'RetryOperationForwarded');

        notifier.subscribe($scope, function (event, data) {
            retryOperationEventHandler(data, 'completed');
            getHistoricGroups();
            if (data.failed) {
                toastService.showInfo("Group " + data.originator + " was retried however and error have occured and not all messages were retried. Retry the remaining messages afterwards.", true);
            } else {
                toastService.showInfo("Group " + data.originator + " was retried succesfully.", true);
            }
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
        "failedMessageGroupsService",
        "toastService"
    ];

    angular.module("sc")
        .controller("failedMessageGroupsController", controller);

})(window, window.angular);