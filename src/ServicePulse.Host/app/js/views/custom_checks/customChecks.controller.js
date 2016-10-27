; (function (window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        sharedDataService,
        serviceControlService,
        notifyService) {

        $scope.model = { data: [], total: 0 };
        $scope.loadingData = false;
        $scope.disableLoadingData = false;

        var page = 1;

        $scope.loadMoreResults = function () {
            if ($scope.loadingData) {
                return;
            }

            $scope.loadingData = true;
            load(page++);
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
            load(page);
        }

        function load(page) {
            serviceControlService.getFailingCustomChecks(page).then(function (response) {

                $scope.loadingData = false;

                $scope.model.data = $scope.model.data.concat(response.data);
                $scope.model.total = response.total;

                if ($scope.model.data.length >= $scope.model.total) {
                    $scope.disableLoadingData = true;
                }
            });
        };
    };

    controller.$inject = [
        '$scope',
        'sharedDataService',
        'serviceControlService',
        'notifyService'
    ];

    angular.module('customChecks')
        .controller('CustomChecksCtrl', controller);

} (window, window.angular));