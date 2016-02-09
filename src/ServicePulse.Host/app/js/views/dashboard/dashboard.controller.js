; (function (window, angular, undefined) {

    'use strict';

    function controller(
        $scope,
		$log,
		serviceControlService,
        notifyService
		) {

        var notifier = notifyService();

		$scope.model = { active_endpoints: 0, failing_endpoints: 0, number_of_failed_messages: 0, number_of_failed_checks: 0 };

		serviceControlService.getHeartbeatStats().then(function (stat) {
		    notifier.notify('HeartbeatsUpdated', {
		        failing: stat.failing,
		        active: stat.active
		    });
		});

		serviceControlService.getTotalFailedMessages().then(function (response) {
		    notifier.notify('MessageFailuresUpdated', response);
		});

		serviceControlService.getTotalFailingCustomChecks().then(function (response) {
		    notifier.notify('CustomChecksUpdated', response);
		});

		notifier.subscribe($scope, function(event, data) {
		     $scope.model.number_of_failed_checks = data;
		}, 'CustomChecksUpdated');

		notifier.subscribe($scope, function(event, data) {
		     $scope.model.number_of_failed_messages = data;
		}, 'MessageFailuresUpdated');

		notifier.subscribe($scope, function (event, data) {
		    $scope.model.active_endpoints = data.active;
		    $scope.model.failing_endpoints = data.failing;
		}, 'HeartbeatsUpdated');
    }

    controller.$inject = [
        '$scope',
        '$log',
		'serviceControlService',
        'notifyService'
    ];

    angular.module('dashboard')
        .controller('DashboardCtrl', controller);


} (window, window.angular));