'use strict';

angular.module('dashboard', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/dashboard', { templateUrl: 'js/dashboard/dashboard.tpl.html', controller: 'DashboardCtrl' });
    }])
    .controller('DashboardCtrl', ['$log', '$scope', 'streamService', 'serviceControlService', function ($log, $scope, streamService, serviceControlService) {

        $scope.model = { active_endpoints: 0, failing_endpoints: 0, number_of_failed_messages: 0, number_of_failed_checks: 0 };

        var endpointCountLastUpdated;
        serviceControlService.getHeartbeatStats().then(function(stat) {
            $scope.model.active_endpoints = stat.active_endpoints;
            $scope.model.failing_endpoints = stat.failing_endpoints;
            endpointCountLastUpdated = Date.now();
        });

        serviceControlService.getTotalFailedMessages().then(function (response) {
            $scope.model.number_of_failed_messages = response;
        });
        
        serviceControlService.getTotalCustomChecks().then(function (response) {
            $scope.model.number_of_failed_checks = response;
        });

        streamService.subscribe($scope, 'TotalCustomCheckUpdated', function (message) {
            $scope.model.number_of_failed_checks = message.total;
        });

        streamService.subscribe($scope, 'TotalErrorMessagesUpdated', function (message) {
            $scope.model.number_of_failed_messages = message.total;
        });

        streamService.subscribe($scope, 'MessageFailed', function () {
            $scope.model.number_of_failed_messages++;
        });

        streamService.subscribe($scope, 'MessageFailureResolved', function () {
            $scope.model.number_of_failed_messages--;
        });

        streamService.subscribe($scope, 'TotalEndpointsUpdated', function (message) {
            // we can get these events out of order. So, ignore the current event, if we have processed one that was more update to date.
            var eventDate = new Date(Date.parse(message.last_updated_at));
            if (eventDate > endpointCountLastUpdated) {
                $scope.model.failing_endpoints = message.failing;
                $scope.model.active_endpoints = message.active;
                endpointCountLastUpdated = eventDate;
            }
        });

        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'TotalEndpointsUpdated');
            streamService.unsubscribe($scope, 'TotalErrorMessagesUpdated');
            streamService.unsubscribe($scope, 'TotalCustomCheckUpdated');
            streamService.unsubscribe($scope, 'MessageFailed');
            streamService.unsubscribe($scope, 'MessageFailureResolved');            
        });
    }]);