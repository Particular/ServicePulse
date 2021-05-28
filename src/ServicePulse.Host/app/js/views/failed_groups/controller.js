(function (window, angular) {
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
        $routeParams,
        commentModalService) {

        var vm = this;
        var notifier = notifyService();

        serviceControlService.performingDataLoadInitially = true;

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
            group.workflow_state = { status: "archivestarted", message: 'Delete request initiated...' };

            vm.deleteComment(group);

            failedMessageGroupsService.archiveGroup(group.id,
                    'Delete group request enqueued',
                    'Delete group request rejected')
                .then(function() {
                        notifier.notify('ArchiveGroupRequestAccepted', group);
                    },
                    function(message) {
                        group.workflow_state = createWorkflowState('error');
                        toastService.showError("Delete request for" + group.title + " failed: " + message);
                        notifier.notify('ArchiveGroupRequestRejected', group);
                    });
        };

        vm.deleteComment = function(group, $event){
            serviceControlService.deleteComment(group.id,
                'Note deleted succesfully',
                'Failed to delete a Note').then(function(){
                group.comment = '';
            });
            if($event) {
                $event.stopPropagation();
            }
        }

        vm.editComment = function(group, comment, $event){
            commentModalService.displayEditCommentModal(comment, group);
            $event.stopPropagation();
        }

        vm.addComment = function(group, comment, $event){
            commentModalService.displayCreateCommentModal(comment, group);
            $event.stopPropagation();
        }

        vm.retryExceptionGroup = function(group) {
            group.workflow_state = { status: 'waiting' };

            vm.deleteComment(group);
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
                        vm.exceptionGroups.sort(getSort());

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

        var comparers = {
            asc: function (selector) {
                return function (firstElement, secondElement) {
                    return selector(firstElement) < selector(secondElement) ? -1 : 1;
                }
            },
            desc: function (selector) {
                return function (firstElement, secondElement) {
                    return selector(firstElement) < selector(secondElement) ? 1 : -1;
                }
            }
        };

        vm.sortSelectors = [{
            description: 'Name',
            selector: function (group) { return group.title; }
        }, {
            description: 'Number of messages',
            selector: function (group) { return group.count; }
        }, {
            description: 'First Failed Time',
            selector: function (group) { return group.first; }
        }, {
            description: 'Last Failed Time',
            selector: function (group) { return group.last; }
        }, {
            description: 'Last Retried Time',
            selector: function (group) { return group.last_operation_completion_time; }
        }];

        var saveSort = function(sortCriteria, sortDirection) {
            $cookies.put('sortCriteria', sortCriteria);
            $cookies.put('sortDirection', sortDirection);

            vm.selectedSort = getDefaultSortSelection();
        };

        var getSort = function() {
            var sortBy = vm.sortSelectors[0].description;
            var sortDir = 'asc';

            if ($routeParams.sortBy) {
                sortBy = $routeParams.sortBy;
                sortDir = ($routeParams.sortdir || 'asc').toLowerCase();

                saveSort($routeParams.sortBy, sortDir);
            } else if ($cookies.get('sortCriteria')) {
                sortBy = $cookies.get('sortCriteria');
                sortDir = ($cookies.get('sortDirection') || 'asc').toLowerCase();
            }

            var propertySelector = vm.sortSelectors.find(function (selector) { return selector.description.toLowerCase() === sortBy.toLowerCase(); }).selector;
            return comparers[sortDir](propertySelector);
        };

        var getDefaultSortSelection = function() {
            var sortBy = vm.sortSelectors[0].description;
            var sortDir = '';

            if ($cookies.get('sortCriteria')) {
                sortBy = $cookies.get('sortCriteria');
                sortDir = ($cookies.get('sortDirection') || 'asc').toLowerCase();

                if (sortDir === 'asc') {
                    sortDir = '';
                } else {
                    sortDir = ' (Desc)'
                }
            }

            return vm.sortSelectors.find(function (selector) { return selector.description.toLowerCase() === sortBy.toLowerCase(); }).description + sortDir;
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

            vm.selectedSort = getDefaultSortSelection();

            serviceControlService.getExceptionGroupClassifiers().then(function (classifiers) {
                vm.availableClassifiers = classifiers;
                vm.selectedClassification = getDefaultClassification(classifiers);

                autoGetExceptionGroups().then(function () {
                    vm.loadingData = false;
                    vm.initialLoadComplete = true;

                    notifier.notify('InitialLoadComplete');

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
                            vm.exceptionGroups.sort(getSort());
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
        '$routeParams',
        'commentModalService'
    ];

    angular.module("sc")
        .controller("failedMessageGroupsController", controller);

})(window, window.angular);
