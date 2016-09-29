; (function (window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        sharedDataService,
        serviceControlService,
        notifyService) {

        $scope.failedChecks = {};
        $scope.failedChecks.model = { data: [], total: 0 };
        $scope.failedChecks.loadingData = false;
        $scope.failedChecks.disableLoadingData = false;
        $scope.failedChecks.page = 1;
        $scope.failedChecks.load = serviceControlService.getFailingCustomChecks;
        
        $scope.successfulChecks = {};
        $scope.successfulChecks.model = { data: [], total: 0 };
        $scope.successfulChecks.loadingData = false;
        $scope.successfulChecks.disableLoadingData = false;
        $scope.successfulChecks.page = 1;
        $scope.successfulChecks.load = serviceControlService.getSuccessfulCustomChecks;

        $scope.loadMoreResults = function (checks) {
            if (checks.loadingData) {
                return;
            }

            checks.loadingData = true;
            load(checks);
            checks.page++;
        };

        $scope.mute = function (row) {
            serviceControlService.muteCustomChecks(row);
        };

        var notifier = notifyService();
        notifier.subscribe($scope,
            function() {
                reloadData($scope.failedChecks);
                reloadData($scope.successfulChecks);
            }, 'CustomChecksUpdated');

        function reloadData(checks) {
            checks.page = 1;
            checks.loadingData = true;
            checks.model = { data: [], total: 0 };
            checks.disableLoadingData = false;
            load(checks);
        }

        function load(checks) {
            checks.load(checks.page).then(function (response) {

                checks.loadingData = false;

                checks.model.data = checks.model.data.concat(response.data);
                checks.model.total = response.total;

                if (checks.model.data.length >= checks.model.total) {
                    checks.disableLoadingData = true;
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