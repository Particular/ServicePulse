'use strict';

angular.module('dashboard', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/dashboard', { templateUrl: 'js/dashboard/dashboard.html', controller: 'DashboardCtrl' });
    }])
    .controller('DashboardCtrl', ['$log', '$scope', 'streamService', 'serviceControlService', function ($log, $scope, streamService, serviceControlService) {

        $scope.model = { active_endpoints: 0, failing_endpoints: 0, number_of_failed_messages: 0, number_of_failed_checks: 0 };

        serviceControlService.getHeartbeatStats().then(function(stat) {
            $scope.model.active_endpoints = stat.active_endpoints;
            $scope.model.failing_endpoints = stat.failing_endpoints;
        });

        serviceControlService.getTotalFailedMessages().then(function (response) {
            $scope.model.number_of_failed_messages = response;
        });

        streamService.subscribe($scope, 'CustomCheckFailed', function () {
            $scope.model.number_of_failed_checks++;
        });

        streamService.subscribe($scope, 'CustomCheckSucceeded', function () {
            $scope.model.number_of_failed_checks--;
        });
        
        streamService.subscribe($scope, 'MessageFailed', function () {
            $scope.model.number_of_failed_messages++;
        });
        
        streamService.subscribe($scope, 'EndpointFailedToHeartbeat', function() {
            $scope.model.failing_endpoints++;
            $scope.model.active_endpoints--;
        });

        streamService.subscribe($scope, 'EndpointHeartbeatRestored', function() {
            $scope.model.failing_endpoints--;
            $scope.model.active_endpoints++;
        });

        streamService.subscribe($scope, 'HeartbeatingEndpointDetected', function() {
            $scope.model.active_endpoints++;
        });

        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'EndpointHeartbeatRestored');
            streamService.unsubscribe($scope, 'HeartbeatingEndpointDetected');
            streamService.unsubscribe($scope, 'EndpointFailedToHeartbeat');
            streamService.unsubscribe($scope, 'MessageFailed');
            streamService.unsubscribe($scope, 'CustomCheckSucceeded');
            streamService.unsubscribe($scope, 'CustomCheckFailed');
        });
    }]);