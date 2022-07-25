(function (window, angular) {

    'use strict';

    function controller(
        $scope,
		$log,
        notifyService,
        sharedDataService
		) {

        var notifier = notifyService();
        $scope.model = sharedDataService.getstats();

		notifier.subscribe($scope, function(event, data) {
			$scope.model.number_of_failed_checks = data;
		}, 'CustomChecksUpdated');

		notifier.subscribe($scope, function(event, data) {
			$scope.model.number_of_failed_messages = data;
		}, 'MessageFailuresUpdated');

		notifier.subscribe($scope, function (event, data) {
			$scope.model.number_of_archived_messages = data;
		}, 'ArchivedMessagesUpdated');

		notifier.subscribe($scope, function (event, data) {
			$scope.model.active_endpoints = data.active;
			$scope.model.failing_endpoints = data.failing;
		}, 'HeartbeatsUpdated');
    }

    controller.$inject = [
        '$scope',
        '$log',
        'notifyService',
        "sharedDataService"
    ];

    angular.module('dashboard')
        .controller('DashboardCtrl', controller);


} (window, window.angular));