'use strict';

angular.module('endpoints', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/endpoints', { templateUrl: 'js/endpoints/endpoints.tpl.html', controller: 'EndpointsCtrl' });
    }])
    .controller('EndpointsCtrl', ['$scope', 'serviceControlService', '$timeout', function ($scope, serviceControlService, $timeout) {

        $scope.model = [];

        var timeoutId;

        $scope.removeEndpoint = function(endpoint) {
            serviceControlService.removeEndpoint(endpoint);
        };
        
        $scope.$on('$destroy', function () {
            $timeout.cancel(timeoutId);
        });

        function updateUI() {
            serviceControlService.getHeartbeatsList().then(function(heartbeats) {
                $scope.model = heartbeats;
            });
        }

        timeoutId = $timeout(function () {
            updateUI();
        }, 5000);
        
        updateUI();
    }]);