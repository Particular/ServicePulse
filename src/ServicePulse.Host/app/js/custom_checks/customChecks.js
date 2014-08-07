'use strict';

angular.module('customChecks', [])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/customChecks', { templateUrl: 'js/custom_checks/customChecks.tpl.html', controller: 'CustomChecksCtrl' });
    }])
    .controller('CustomChecksCtrl', ['$scope', 'serviceControlService',  'streamService', function ($scope, serviceControlService, streamService) {

        $scope.model = { data: [], total: 0};
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

        $scope.mute = function(row) {
            serviceControlService.muteCustomChecks(row);
        };
        

        streamService.subscribe($scope, 'CustomChecksUpdated', function (event) {
            $scope.loadingData = true;
            $scope.model = { data: [], total: 0 };
            $scope.disableLoadingData = false;
            load(1);
        });

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
    }]);