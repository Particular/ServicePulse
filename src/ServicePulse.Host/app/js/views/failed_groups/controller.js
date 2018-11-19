;
(function (window, angular, undefined) {
    "use strict";

    function createWorkflowState(optionalStatus, optionalTotal, optionalFailed) {
        if (optionalTotal && optionalTotal <= 1) {
            optionalTotal = optionalTotal * 100;
        }
        return {
            status: optionalStatus || 'working',
            total: optionalTotal || 0,
            failed: optionalFailed || false
        };
    }

    function controller(
        $scope,
        $timeout,
        $interval,
        $location,
        $cookies,
        sharedDataService,
        notifyService,
        serviceControlService,
        failedMessageGroupsService,
        toastService,
        $routeParams) {

        var vm = this;
        var notifier = notifyService();
       
        vm.loadingData = false;
        vm.exceptionGroups = [];
        vm.availableClassifiers = [];
        vm.selectedExceptionGroup = {};
        vm.stats = sharedDataService.getstats();

        vm.viewExceptionGroup = function (group) {
            if (vm.isBeingArchived(group.operation_status) || vm.isBeingRetried(group)) {
                return;
            }
            sharedDataService.set(group);
            $location.path('/failed-messages/groups/' + group.id);
        };

        vm.acknowledgeGroup = function (group, $event) {
            serviceControlService.acknowledgeGroup(group.id)
                .then(function() {
                    vm.exceptionGroups.splice(vm.exceptionGroups.indexOf(group), 1);
                });
            $event.stopPropagation();
        };

        vm.acknowledgeArchiveGroup = function (group, $event) {
            serviceControlService.acknowledgeArchiveGroup(group.id,
                'Group Acknowledged',
                'Acknowledging Group Failed')
                .then(function () {
                    vm.exceptionGroups.splice(vm.exceptionGroups.indexOf(group), 1);
                });
            $event.stopPropagation();
        };

        vm.archiveExceptionGroup = function(group) {
            group.workflow_state = { status: "archivestarted", message: 'Archive request initiated...' };
            failedMessageGroupsService.archiveGroup(group.id,
                    'Archive Group Request Enqueued',
                    'Archive Group Request Rejected')
                .then(function() {
                        notifier.notify('ArchiveGroupRequestAccepted', group);
                    },
                    function(message) {
                        group.workflow_state = createWorkflowState('error');
                        toastService.showError("Archive request for" + group.title + " failed: " + message);
                        notifier.notify('ArchiveGroupRequestRejected', group);
                    });
        };

        vm.retryExceptionGroup = function(group) {
            group.workflow_state = { status: 'waiting' };

            failedMessageGroupsService.retryGroup(group.id,
                    'Retry Group Request Enqueued',
                    'Retry Group Request Rejected')
                .then(function() {
                        // We are going to have to wait for service control to tell us the job has been done
                        notifier.notify('RetryGroupRequestAccepted', group);

                    },
                    function(message) {
                        group.workflow_state = createWorkflowState('error');
                        toastService.showError("Retry request for" + group.title + " failed: " + message);
                        notifier.notify('RetryGroupRequestRejected', group);
                    });
        };

        var getClasses = function (stepStatus, currentStatus, statusArray) {
            var indexOfStep = statusArray.indexOf(stepStatus);
            var indexOfCurrent = statusArray.indexOf(currentStatus);
            if (indexOfStep > indexOfCurrent) {
                return 'left-to-do';
            } else if (indexOfStep === indexOfCurrent) {
                return 'active';
            } else {
                return 'completed';
            }
        };

        var statusesForRetryOperation = ['waiting', 'preparing', 'queued', 'forwarding'];
        vm.getClassesForRetryOperation = function(stepStatus, currentStatus) {
            if (currentStatus === 'queued') {
                currentStatus = 'forwarding';
            }
            return getClasses(stepStatus, currentStatus, statusesForRetryOperation);
        };

        var statusesForArchiveOperation = ['archivestarted', 'archiveprogressing', 'archivefinalizing', 'archivecompleted'];
        vm.getClassesForArchiveOperation = function(stepStatus, currentStatus) {
            return getClasses(stepStatus, currentStatus, statusesForArchiveOperation);
        };

        vm.isBeingRetried = function(group) {
            return group.workflow_state.status !== 'none' && (group.workflow_state.status !== 'completed' || group.need_user_acknowledgement === true) && !vm.isBeingArchived(group.workflow_state.status);
        };

        vm.isBeingArchived = function (status) {
            return status === "archivestarted" || status === "archiveprogressing" || status === "archivefinalizing" || status === "archivecompleted";
        };

        var initializeGroupState = function (group) {
            var operationStatus = (group.operation_status ? group.operation_status.toLowerCase() : null) ||
                'none';
            if (operationStatus === 'preparing' && group.operation_progress === 1) {
                operationStatus = 'queued';
            }

            group.workflow_state = createWorkflowState(operationStatus, group.operation_progress, group.operation_failed);

            return group;
        };

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

        var saveSelectedClassification = function(classification) {
            $cookies.put("failed_groups_classification", classification);
        };

        var getDefaultClassification = function (classifiers) {
            if ($routeParams.groupBy) {
                saveSelectedClassification($routeParams.groupBy);
                return $routeParams.groupBy;
            }

            var storedClassification = $cookies.get("failed_groups_classification");

            if (typeof storedClassification === "undefined") {
                return classifiers[0];
            }

            return storedClassification;
        };

        vm.selectClassification = function (newClassification) {
            vm.loadingData = true;
            vm.selectedClassification = newClassification;

            saveSelectedClassification(newClassification);

            return autoGetExceptionGroups().then(function () {
                vm.loadingData = false;

                return true;
            });
        };

        var initialLoad = function () {
            vm.loadingData = true;

            serviceControlService.getExceptionGroupClassifiers().then(function (classifiers) {
                vm.availableClassifiers = classifiers;
                vm.selectedClassification = getDefaultClassification(classifiers);

                autoGetExceptionGroups().then(function () {
                    vm.loadingData = false;
                    vm.initialLoadComplete = true;

                    return true;
                });
            });
        };

        vm.updateExceptionGroups = function() {
            return serviceControlService.getExceptionGroups(vm.selectedClassification)
                .then(function(response) {
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

        var groupUpdatedInterval = $interval(function () {
            getHistoricGroups();
            vm.updateExceptionGroups();
        }, 5000);

        $scope.$on("$destroy", function () {
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
                        data.progress.percentage);

                item.operation_remaining_count = data.progress.messages_remaining;
                item.operation_messages_completed_count = data.progress.number_of_messages_archived;
                item.operation_start_time = data.start_time;

                if (status === "archivecompleted") {
                    item.operation_completion_time = data.completion_time;
                    item.need_user_acknowledgement = true;
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
            archiveOperationEventHandler(data, "archivefinalizing");
        }, 'ArchiveOperationFinalizing');

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
        "$cookies",
        "sharedDataService",
        "notifyService",
        "serviceControlService",
        "failedMessageGroupsService",
        "toastService",
        '$routeParams'
    ];

    angular.module("sc")
        .controller("failedMessageGroupsController", controller);

})(window, window.angular);