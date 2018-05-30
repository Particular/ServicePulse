; (function (window, angular, undefined) {
	'use strict';

	function factory($rootScope, serviceControlService, notifyService) {
		var notifier = notifyService();

		var trackingInterval;
		var previousStatus;

		function startTrackingStatus() {
			stopTrackingStatus();

			trackingInterval = setInterval(function () {
				serviceControlService.isBusyUpgradingIndexes().then(function (result) {
					var inProgress = result.data.in_progress;

					if (inProgress != previousStatus) {
						if (inProgress && typeof previousStatus == 'undefined') {
							notifier.notify('reindexing', 'ServiceControl is busy recreating indexes after a database upgrade...');
						} else if (previousStatus) {
							notifier.notify('reindexing', 'Reindexing after database upgrade has completed.');
						}

						previousStatus = inProgress;
					}
				});
			}, 60000);
		}

		function stopTrackingStatus() {
			if (trackingInterval) {
				clearInterval(trackingInterval);

				trackingInterval = undefined;
			}

			previousStatus = undefined;
		}

		return {
			startTrackingStatus: startTrackingStatus,
			stopTrackingStatus: stopTrackingStatus
		};
	}

	factory.$inject = [
        '$rootScope',
        'serviceControlService',
		'notifyService'
	];

	angular.module('sc')
        .service('reindexingChecker', factory);

} (window, window.angular));