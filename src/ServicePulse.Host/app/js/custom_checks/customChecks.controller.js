; (function (window, angular, undefined) {
    'use strict';

    function controller($scope, serviceControlService, streamService) {

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

        $scope.mute = function (row) {
            serviceControlService.muteCustomChecks(row);
        };

        var subscriptionDisposalMethods = [];

        subscriptionDisposalMethods.push(streamService.subscribe('CustomChecksUpdated', function () {
            reloadData();
        }));

        subscriptionDisposalMethods.push(streamService.subscribe('CustomCheckDeleted', function () {
            reloadData();
        }));

        $scope.$on('$destroy', function () {
            for (var i = 0; i < subscriptionDisposalMethods.length; i++) {
                subscriptionDisposalMethods[i]();
            }
        });

        function reloadData() {
            $scope.loadingData = true;
            $scope.model = { data: [], total: 0 };
            $scope.disableLoadingData = false;
            load(1);
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
        'serviceControlService',
        'streamService'
    ];

    angular.module('customChecks')
        .controller('CustomChecksCtrl', controller);

} (window, window.angular));