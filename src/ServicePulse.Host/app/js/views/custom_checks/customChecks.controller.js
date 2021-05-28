(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        sharedDataService,
        serviceControlService,
        notifyService) {

        $scope.model = { data: []};
        $scope.loadingData = false;
        $scope.reloadCount = 0;

        $scope.pager = {
            page: 1,
            total: 1,
            perPage: 25
        }

        $scope.loadMoreResults = function () {
            if ($scope.loadingData) {
                return;
            }

            $scope.loadingData = true;
            load($scope.pager.page, $scope.reloadCount);
        };

        $scope.dismiss = function (row) {
            serviceControlService.dismissCustomChecks(row);
        };

        var notifier = notifyService();
        notifier.subscribe($scope, reloadData, 'CustomChecksUpdated');

        function reloadData() {
            $scope.pager.page = 1;
            $scope.pager.total = 1;
            $scope.loadingData = true;
            $scope.model = { data: [] };
            $scope.reloadCount++;

            load($scope.pager.page, $scope.reloadCount);
        }

        function load(page, reloadCount) {
            serviceControlService.getFailingCustomChecks(page).then(function (response) {

                //If the load was called before last result reload it should be discarded
                if (reloadCount < $scope.reloadCount) {
                    return;
                }

                $scope.loadingData = false;

                $scope.model.data = response.data;
                $scope.pager.total = response.total;
            });
        }

        reloadData();
    }

    controller.$inject = [
        '$scope',
        'sharedDataService',
        'serviceControlService',
        'notifyService'
    ];

    angular.module('customChecks')
        .controller('CustomChecksCtrl', controller);

} (window, window.angular));