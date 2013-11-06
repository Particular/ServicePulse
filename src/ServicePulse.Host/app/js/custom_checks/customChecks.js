'use strict';

angular.module('customChecks', [])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/customChecks', { templateUrl: 'js/custom_checks/customChecks.tpl.html', controller: 'CustomChecksCtrl' });
    }])
    .controller('CustomChecksCtrl', ['$scope', 'serviceControlService', 'streamService', function ($scope, serviceControlService, streamService) {

        $scope.model = { data: [], total: 0};

        serviceControlService.getCustomChecks().then(function (results) {
            $scope.model.data = results.data;
            $scope.model.total = results.total;
        });
    }]);