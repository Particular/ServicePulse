(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        $timeout,
        $interval,
        $location,
        $cookies,
        sharedDataService,
        notifyService,
        serviceControlService,
        archivedMessageGroupsService,
        toastService,
        $routeParams) {

        var vm = this;
        var notifier = notifyService();

        serviceControlService.performingDataLoadInitially = true;
       
        vm.loadingData = false;
        vm.archiveGroups = [];
        vm.availableClassifiers = [];
        vm.selectedClassification = '';
        vm.stats = sharedDataService.getstats();

        vm.viewExceptionGroup = function (group) {
            sharedDataService.set(group);
            $location.path('/failed-messages/groups/' + group.id);
        };

        vm.unarchiveGroup = function (group) {
            debugger;
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

        var getArchivedGroups = function () {
            vm.archiveGroups = [];
            return archivedMessageGroupsService.getArchivedGroups(vm.selectedClassification)
                .then(function (response) {
                    debugger;
                    if (response.status === 304 && vm.archiveGroups.length > 0) {
                        return true;
                    }

                    if (response.data.length > 0) {

                        vm.archiveGroups = response.data;

                        if (vm.archiveGroups.length !== vm.stats.number_of_archive_groups) {
                            vm.stats.number_of_archive_groups = vm.archiveGroups.length;
                            notifier.notify('ArchiveGroupCountUpdated', vm.stats.number_of_archive_groups);
                        }
                    }
                    return true;
                });
        };

        var saveSelectedClassification = function(classification) {
            $cookies.put('archived_groups_classification', classification);
        };

        var getDefaultClassification = function (classifiers) {
            if ($routeParams.groupBy) {
                saveSelectedClassification($routeParams.groupBy);
                return $routeParams.groupBy;
            }

            var storedClassification = $cookies.get('archived_groups_classification');

            if (typeof storedClassification === 'undefined') {
                return classifiers[0];
            }

            return storedClassification;
        };

        vm.selectClassification = function (newClassification) {
            vm.loadingData = true;
            vm.selectedClassification = newClassification;

            saveSelectedClassification(newClassification);

            return getArchivedGroups().then(function () {
                vm.loadingData = false;

                return true;
            });
        };

        var initialLoad = function () {
            vm.loadingData = true;

            archivedMessageGroupsService.getArchivedGroupClassifiers().then(function (classifiers) {
                vm.availableClassifiers = classifiers;
                vm.selectedClassification = getDefaultClassification(classifiers);
            });

            getArchivedGroups().then(function () {
                vm.loadingData = false;
                vm.initialLoadComplete = true;
                
                notifier.notify('InitialLoadComplete');

                return true;
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

        $scope.$on('$destroy', function () {
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

                if (status === 'archivecompleted') {
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
            archiveOperationEventHandler(data, 'archivestarted');
        }, 'ArchiveOperationStarting');

        notifier.subscribe($scope, function (event, data) {
            archiveOperationEventHandler(data, 'archiveprogressing');
        }, 'ArchiveOperationBatchCompleted');

        notifier.subscribe($scope, function (event, data) {
            archiveOperationEventHandler(data, 'archivefinalizing');
        }, 'ArchiveOperationFinalizing');

        notifier.subscribe($scope, function (event, data) {
            archiveOperationEventHandler(data, 'archivecompleted');
            getHistoricGroups();
            
            toastService.showInfo('Group ' + data.group_name + ' was archived succesfully.', 'Archive operation completed', true);
            
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
                toastService.showInfo('Group ' + data.originator + ' was retried however and error have occured and not all messages were retried. Retry the remaining messages afterwards.', 'Retry operation completed', true);
            } else {
                toastService.showInfo('Group ' + data.originator + ' was retried succesfully.', 'Retry operation completed', true);
            }
        }, 'RetryOperationCompleted');

        // INIT
        initialLoad();
        getHistoricGroups();
    }

    controller.$inject = [
        '$scope',
        '$timeout',
        '$interval',
        '$location',
        '$cookies',
        'sharedDataService',
        'notifyService',
        'serviceControlService',
        'archivedMessageGroupsService',
        'toastService',
        '$routeParams'
    ];

    angular.module('sc')
        .controller('archivedMessageGroupsController', controller);

})(window, window.angular);