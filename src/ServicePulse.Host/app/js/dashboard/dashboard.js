'use strict';

angular.module('dashboard', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/dashboard', { templateUrl: 'js/dashboard/dashboard.tpl.html', controller: 'DashboardCtrl' });
    }])
    .controller('DashboardCtrl', ['$log', '$scope', 'streamService', 'serviceControlService', function ($log, $scope, streamService, serviceControlService) {

        $scope.model = { active_endpoints: 0, failing_endpoints: 0, number_of_failed_messages: 0, number_of_failed_checks: 0 };

        var heartbeatsUpdated = new OutOfOrderPurger();
        var failedMessageUpdated = new OutOfOrderPurger();
        var customChecksUpdated = new OutOfOrderPurger();

        serviceControlService.getHeartbeatStats().then(function(stat) {
            $scope.model.active_endpoints = stat.active;
            $scope.model.failing_endpoints = stat.failing;
            heartbeatsUpdated.resetToNow();
        });

        serviceControlService.getTotalFailedMessages().then(function(response) {
            $scope.model.number_of_failed_messages = response;
            failedMessageUpdated.resetToNow();
        });

        serviceControlService.getTotalCustomChecks().then(function (response) {
            $scope.model.number_of_failed_checks = response;
            customChecksUpdated.resetToNow();
        });

        streamService.subscribe($scope, 'CustomChecksUpdated', function (message) {
            customChecksUpdated.runIfLatest(message, function() {
                $scope.model.number_of_failed_checks = message.failed;
            });
        });

        streamService.subscribe($scope, 'MessageFailuresUpdated', function (message) {
            failedMessageUpdated.runIfLatest(message, function() {
                $scope.model.number_of_failed_messages = message.total;
            });
        });

        streamService.subscribe($scope, 'HeartbeatsUpdated', function (message) {
            heartbeatsUpdated.runIfLatest(message, function() {
                $scope.model.failing_endpoints = message.failing;
                $scope.model.active_endpoints = message.active;
            });
        });

        $scope.$on('$destroy', function () {
            streamService.unsubscribe($scope, 'HeartbeatsUpdated');
            streamService.unsubscribe($scope, 'CustomChecksUpdated');
            streamService.unsubscribe($scope, 'MessageFailuresUpdated');
        });

        function OutOfOrderPurger() {
            var latestData = Date.now();

            this.resetToNow = function() {
                latestData = Date.now();
            };

            this.runIfLatest = function (message, func) {
                var raisedAt = new Date(Date.parse(message.raised_at));

                if (raisedAt > latestData) {
                    latestData = raisedAt;
                    func();
                }
            };
        }
    }]);