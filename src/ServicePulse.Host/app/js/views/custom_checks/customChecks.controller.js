(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        sharedDataService,
        serviceControlService,
        notifyService) {

        $scope.model = { data: [], total: 0 };
        $scope.loadingData = false;
        $scope.disableLoadingData = false;
        $scope.reloadCount = 0;

        var page = 1;

        $scope.loadMoreResults = function () {
            if ($scope.loadingData) {
                return;
            }

            $scope.loadingData = true;
            load(page++, $scope.reloadCount);
        };

        $scope.dismiss = function (row) {
            serviceControlService.dismissCustomChecks(row);
        };

        var notifier = notifyService();
        notifier.subscribe($scope, reloadData, 'CustomChecksUpdated');

        function reloadData() {
            page = 1;
            $scope.loadingData = true;
            $scope.model = { data: [], total: 0 };
            $scope.disableLoadingData = false;
            $scope.reloadCount++;

            load(page, $scope.reloadCount);
        }

        function load(page, reloadCount) {
            serviceControlService.getFailingCustomChecks(page).then(function (response) {

                //If the load was called before last result reload it should be discarded
                if (reloadCount < $scope.reloadCount) {
                    return;
                }

                $scope.loadingData = false;

                $scope.model.data = $scope.model.data.concat(response.data);
                $scope.model.total = response.total;

                if ($scope.model.data.length >= $scope.model.total) {
                    $scope.disableLoadingData = true;
                }
            });
        }
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