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
        $routeParams) {

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
        '$routeParams'
    ];

    angular.module('sc')
        .controller('archivedMessageGroupsController', controller);

})(window, window.angular);