(function(window, angular) {

	'use strict';

	function controller(
		$scope,
		$location,
		auditLogService,
		$routeParams) {

		$scope.loadingData = true;

		var subscription;

		$scope.viewCategory = function (eventLogItem) {
			switch (eventLogItem.category) {
				case 'Endpoints':
					window.location.href = '/#/configuration/endpoint-connection';
					break;
				case 'HeartbeatMonitoring':
					$location.path('/endpoints');
					break;
				case 'CustomChecks':
					$location.path('/custom-checks');
					break;
				case 'EndpointControl':
					$location.path('/endpoints');
					break;
				case 'MessageFailures':
					var newlocation = '/#/failed-messages';
					if (eventLogItem.related_to && eventLogItem.related_to[0].search('message') > 0) {
						newlocation = '/#/failed-messages' + eventLogItem.related_to[0];
					}
					window.location.href = newlocation;
					break;
				case 'Recoverability':
					window.location.href = '/#/failed-messages';
					break;
				case 'MessageRedirects':
					window.location.href='/#/configuration/retry-redirects';
					break;
				default:
			}
		};

		$scope.eventLog = {
			eventLogPage: 1,
			eventLogTotalItems: 105,
			eventLogItemsPerPage: 20,
			items: []
		};

		function mergeIn(destination, source, propertiesToSkip) {
			for (var propName in source) {
				if (Object.prototype.hasOwnProperty.call(source, propName)) {
					if(!propertiesToSkip || !propertiesToSkip.includes(propName)) {
						destination[propName] = source[propName];
					}
				}
			}
		}

		var getPageSize = function() {
			if ($routeParams.pageSize) {
				$scope.eventLog.eventLogItemsPerPage = $routeParams.pageSize;
			}
		};

		$scope.updateUI  = function () {
			if (subscription) {
				subscription.dispose();
			}

			getPageSize();

			subscription = auditLogService.createAuditLogSource($scope.eventLog.eventLogPage, $scope.eventLog.eventLogItemsPerPage).subscribe(function (auditLog) {

				$scope.loading = false;

				$scope.eventLog.eventLogTotalItems = parseInt(auditLog.total);
				mergeIn($scope.eventLog.items, auditLog.data);
				$scope.$apply();
			});
		};

		$scope.updateUI();
	}

	controller.$inject = [
		'$scope',
		'$location',
		'auditLogService',
		'$routeParams'
	];

	angular.module('events.module')
		.controller('EventsCtrl', controller);

}(window, window.angular));
