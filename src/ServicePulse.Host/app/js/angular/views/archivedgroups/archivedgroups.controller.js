(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        $location,
        $cookies,
        sharedDataService,
        notifyService,
        serviceControlService,
        archivedMessageGroupsService,
        $routeParams,
        failedMessageGroupsService,
        toastService) {

        var vm = this;
        var notifier = notifyService();

        serviceControlService.performingDataLoadInitially = true;

        vm.loadingData = false;
        vm.archiveGroups = [];
        vm.availableClassifiers = [];
        vm.selectedClassification = '';
        vm.stats = sharedDataService.getstats();

        vm.viewArchiveGroup = function (group) {
            $location.url('/failed-messages/archived?groupId=' + group.id);
        };

        var getArchivedGroups = function () {
            vm.archiveGroups = [];
            return archivedMessageGroupsService.getArchivedGroups(vm.selectedClassification)
                .then(function (response) {
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

        vm.isBeingRestored = function (status) {
            return statusesForRestoreOperation.includes(status);
        };

        vm.restoreExceptionGroup = function(group) {
            group.workflow_state = { status: "restorestarted", message: 'Restore request initiated...' };
            failedMessageGroupsService.restoreGroup(group.id,
                'Restore group request enqueued',
                'Restore group request rejected. Make sure that you use ServiceControl v4.18 or higher')
                .then(function() {
                        notifier.notify('RestoreGroupRequestAccepted', group);
                    },
                    function(message) {
                        group.workflow_state = createWorkflowState('error');
                        toastService.showError("Restore request for" + group.title + " failed: " + message);
                        notifier.notify('RestoreGroupRequestRejected', group);
                    });
        };

        var statusesForRestoreOperation = ['restorestarted', 'restoreprogressing', 'restorefinalizing', 'restorecompleted'];
        vm.getClassesForRestoreOperation = function(stepStatus, currentStatus) {
            return getClasses(stepStatus, currentStatus, statusesForRestoreOperation);
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

        var restoreOperationEventHandler = function (data, status) {
            var group = vm.archiveGroups.filter(function (item) { return item.id === data.request_id });

            group.forEach(function (item) {
                item
                    .workflow_state =
                    createWorkflowState(status,
                        data.progress.percentage);

                item.operation_remaining_count = data.progress.messages_remaining;
                item.operation_messages_completed_count = data.progress.number_of_messages_unarchived;
                item.operation_start_time = data.start_time;

                if (status === 'restorecompleted') {
                    item.operation_completion_time = data.completion_time;
                    item.need_user_acknowledgement = true;
                }
            });
        };

        notifier.subscribe($scope, function (event, data) {
            restoreOperationEventHandler(data, 'restorestarted');
        }, 'UnarchiveOperationStarting');

        notifier.subscribe($scope, function (event, data) {
            restoreOperationEventHandler(data, 'restoreprogressing');
        }, 'UnarchiveOperationBatchCompleted');

        notifier.subscribe($scope, function (event, data) {
            restoreOperationEventHandler(data, 'restorefinalizing');
        }, 'UnarchiveOperationFinalizing');

        notifier.subscribe($scope, function (event, data) {
            restoreOperationEventHandler(data, 'restorecompleted');

            toastService.showInfo("Group " + data.group_name + " was restored succesfully.", "Restore operation completed", true);

        }, 'UnarchiveOperationCompleted');

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

                return getArchivedGroups().then(function () {
                    vm.loadingData = false;
                    vm.initialLoadComplete = true;

                    notifier.notify('InitialLoadComplete');

                    return true;
                });
            });
        };

        initialLoad();
    }

    controller.$inject = [
        '$scope',
        '$location',
        '$cookies',
        'sharedDataService',
        'notifyService',
        'serviceControlService',
        'archivedMessageGroupsService',
        '$routeParams',
        'failedMessageGroupsService',
        'toastService'
    ];

    angular.module('sc')
        .controller('archivedMessageGroupsController', controller);

})(window, window.angular);
