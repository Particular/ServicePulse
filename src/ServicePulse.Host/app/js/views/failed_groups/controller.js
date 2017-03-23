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
        vm.stats = sharedDataService.getstats();

        vm.viewExceptionGroup = function(group) {
            sharedDataService.set(group);
            $location.path('/failed-messages/groups/' + group.id);
        };

        vm.acknowledgeGroup = function (group, $event) {
            serviceControlService.acknowledgeGroup(group.id,
                    'Group Acknowledged',
                    'Acknowledging Group Failed')
                .then(function(message) {
                        vm.exceptionGroups.splice(vm.exceptionGroups.indexOf(group), 1);
                });
            $event.stopPropagation();
        }

        vm.archiveExceptionGroup = function(group) {
            group.workflow_state = { status: "archiverequested", message: 'Archive request initiated...' };
            failedMessageGroupsService.archiveGroup(group.id,
                    'Archive Group Request Enqueued',
                    'Archive Group Request Rejected')
                .then(function(message) {
                        notifier.notify('ArchiveGroupRequestAccepted', group);
                    },
                    function(message) {
                        group.workflow_state = createWorkflowState('error', message);
                        notifier.notify('ArchiveGroupRequestRejected', group);
                    });
        };

        vm.retryExceptionGroup = function(group) {
            group.workflow_state = { status: 'waiting', message: getMessageForRetryStatus('waiting') };

            failedMessageGroupsService.retryGroup(group.id,
                    'Retry Group Request Enqueued',
                    'Retry Group Request Rejected')
                .then(function() {
                        // We are going to have to wait for service control to tell us the job has been done
                        notifier.notify('RetryGroupRequestAccepted', group);

                    },
                    function(message) {
                        group.workflow_state = createWorkflowState('error', message);
                        notifier.notify('RetryGroupRequestRejected', group);
                    });
        };


        var statuses = ['waiting', 'preparing', 'queued', 'forwarding'];
        vm.getClasses = function (stepStatus, currentStatus) {
            if (currentStatus === 'queued') {
                currentStatus = 'forwarding';
            }
            var indexOfStep = statuses.indexOf(stepStatus);
            var indexOfCurrent = statuses.indexOf(currentStatus);
            if (indexOfStep > indexOfCurrent) {
                return 'left-to-do';
            }
            else if (indexOfStep === indexOfCurrent) {
                return 'active';
            } else {
                return 'completed';
            }
        }

        vm.isBeingRetried = function(group) {
            return group.workflow_state.status !== 'none' && (group.workflow_state.status !== 'completed' || group.need_user_acknowledgement === true) && !vm.isBeingArchived(group.workflow_state.status);
        };

        vm.isBeingArchived = function (status) {
            return status === "archiverequested" || status === "archivestarted" || status === "archiveprogressing" || status === "archivecompleted";
        };

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

        var initializeGroupState = function(group) {
            var nObj = group;
            var operationStatus = (nObj.operation_status ? nObj.operation_status.toLowerCase() : null) ||
                'none';
            if (operationStatus === 'preparing' && nObj.operation_progress === 1) {
                operationStatus = 'queued';
            }
            var message = '';
            if (vm.isBeingArchived(operationStatus)) {
                message = getMessageForArchiveStatus(operationStatus);
            } else {
                message = getMessageForRetryStatus(operationStatus, nObj.operation_failed);
            }

            nObj
                .workflow_state =
                createWorkflowState(operationStatus,
                message,
                    nObj.operation_progress,
                    nObj.operation_failed);

            return nObj;
        };

        vm.updateExceptionGroups = function () {
            return serviceControlService.getExceptionGroups(vm.selectedClassification)
                .then(function (response) {
                    if (response.status === 304) {
                        return true;
                    }
                    var exceptionGroupsToBeRemoved = vm.exceptionGroups.filter(function(item) {
                        return !response.data.some(function(d) {
                            return d.id === item.id;
                        });
                    });
                    exceptionGroupsToBeRemoved.forEach(function(item) {
                        vm.exceptionGroups.splice(vm.exceptionGroups.indexOf(item), 1);
                    });

                    vm.exceptionGroups.forEach(function(group) {
                        var d = response.data.filter(function(item) {
                            return item.id === group.id;
                        })[0];

                        for (var prop in d) {
                            group[prop] = d[prop];
                        }
                        initializeGroupState(group);
                    });

                    response.data.filter(function(group) {
                            return !vm.exceptionGroups.some(function(item) {
                                return item.id === group.id;
                            });
                        })
                        .forEach(function(group) {
                            vm.exceptionGroups.push(group);
                            initializeGroupState(group);
                        });

                    if (vm.exceptionGroups.length !== vm.stats.number_of_exception_groups) {
                        vm.stats.number_of_exception_groups = vm.exceptionGroups.length;
                        notifier.notify('ExceptionGroupCountUpdated', vm.stats.number_of_exception_groups);
                    }

                    return true;
                });
        }

        var autoGetExceptionGroups = function () {
            vm.exceptionGroups = [];
            return serviceControlService.getExceptionGroups(vm.selectedClassification)
                .then(function (response) {
                    if (response.status === 304 && vm.exceptionGroups.length > 0) {
                        return true;
                    }

                    if (response.data.length > 0) {
                        
                        // need a map in some ui state for controlling animations
                        vm.exceptionGroups = response.data.map(initializeGroupState);

                        if (vm.exceptionGroups.length !== vm.stats.number_of_exception_groups) {
                            vm.stats.number_of_exception_groups = vm.exceptionGroups.length;
                            notifier.notify('ExceptionGroupCountUpdated', vm.stats.number_of_exception_groups);
                        }
                    }
                    return true;
                });
        };

        var historicGroupsEtag;

        var getHistoricGroups = function() {
            serviceControlService.getHistoricGroups()
                .then(function (response) {
                    if (historicGroupsEtag === response.etag) {
                        return true;
                    }
                    historicGroupsEtag = response.etag;
                    vm.historicGroups = response.data.historic_operations;
                });
        };

        function getMessageForArchiveStatus(archiveStatus) {
            if (archiveStatus === "archivestarted") {
                return 'Archive request in progress.';
            }
            if (archiveStatus === "archiveprogressing") {
                return 'Archive request in progress.';
            }
            if (archiveStatus === "archivecompleted") {
                return 'Archive completed';
            }
        }

        function getMessageForRetryStatus(retryStatus, failed) {
            if (retryStatus === 'waiting') {
                return 'Retry request initiated...';
            }

            if (retryStatus === 'queued') {
                return 'Retry request in progress. Next Step - Queued.';
            }

            if (retryStatus === 'preparing') {
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

        var groupUpdatedInterval = $interval(function () {
            getHistoricGroups();
            vm.updateExceptionGroups();
        }, 5000);

        $scope.$on("$destroy", function (event) {
            if (angular.isDefined(groupUpdatedInterval)) {
                $interval.cancel(groupUpdatedInterval);
                groupUpdatedInterval = undefined;
            }
        });

        var archiveOperationEventHandler = function (data, status) {
            var group = vm.exceptionGroups.filter(function (item) { return item.id === data.request_id });

            group.forEach(function (item) {
                item
                    .workflow_state =
                    createWorkflowState(status,
                        getMessageForArchiveStatus(status),
                        data.progress.percentage);

                item.operation_remaining_count = data.progress.messages_remaining;
                item.operation_messages_completed_count = data.progress.number_of_messages_archived;
                item.operation_start_time = data.start_time;

                if (status === "archivecompleted") {
                    item.operation_completion_time = data.completion_time;
                }
            });
        };

        var retryOperationEventHandler = function (data, status) {
            var group = vm.exceptionGroups.filter(function (item) { return item.id === data.request_id });
            
            group.forEach(function (item) {
                    if (status === 'preparing' && data.progress.percentage === 1) {
                        status = 'queued';
                    }
                    item
                        .workflow_state =
                        createWorkflowState(status,
                            getMessageForRetryStatus(status, data.failed || false),
                            data.progress.percentage,
                            data.failed || false);

                    item.operation_remaining_count = data.progress.messages_remaining;
                    item.operation_start_time = data.start_time;

                if (status === 'completed') {
                    item.need_user_acknowledgement = true;
                    item.operation_completion_time = data.completion_time;
                }
            });
        };

        notifier.subscribe($scope, function (event, data) {
            archiveOperationEventHandler(data, "archivestarted");
        }, 'ArchiveOperationStarting');

        notifier.subscribe($scope, function (event, data) {
            archiveOperationEventHandler(data, "archiveprogressing");
        }, 'ArchiveOperationBatchCompleted');

        notifier.subscribe($scope, function (event, data) {
            archiveOperationEventHandler(data, "archivecompleted");
            getHistoricGroups();
            
            toastService.showInfo("Group " + data.group_name + " was archived succesfully.", "Archive operation completed", true);
            
        }, 'ArchiveOperationCompleted');


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
                toastService.showInfo("Group " + data.originator + " was retried however and error have occured and not all messages were retried. Retry the remaining messages afterwards.", "Retry operation completed", true);
            } else {
                toastService.showInfo("Group " + data.originator + " was retried succesfully.", "Retry operation completed", true);
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