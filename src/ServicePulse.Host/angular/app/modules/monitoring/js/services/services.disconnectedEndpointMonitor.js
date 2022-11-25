(function (window, angular, $, Rx) {
    'use strict';

    function Service(notifyService, monitoringService, $log, $rootScope) {
        var disconnectedEndpointsUpdatedEvent = "DisconnectedEndpointsUpdated";

        var notifier = notifyService();

        var checkInterval;

        var checkDisconnectedCount = function () {
            monitoringService.getDisconnectedCount().then(result => {
                notifier.notify(disconnectedEndpointsUpdatedEvent, result.data);
            }, e => {
                $log.debug('Error while getting disconnected endpoints count from monitoring:' + e);
                clearInterval(checkInterval); //Stop checking, probably an old version of Monitoring
            });
        };

        var isConnected = false;

        var startService = function () {
            notifier.subscribe($rootScope, (event, data) => {
                if (data.isMonitoringConnected && isConnected == false) {
                    checkDisconnectedCount();
                    checkInterval = setInterval(checkDisconnectedCount, 20000);
                    isConnected = true;
                } else if (!data.isMonitoringConnected && isConnected) {
                    isConnected = false;
                    clearInterval(checkInterval);
                }
            }, "MonitoringConnectionStatusChanged");
        };

        var service = {
            updatedEvent: disconnectedEndpointsUpdatedEvent,
            startService: startService
        };

        return service;
    }

    Service.$inject = ['notifyService', 'monitoringService', '$log', '$rootScope'];

    angular.module('services.disconnectedEndpointMonitor', ['sc'])
        .service('disconnectedEndpointMonitor', Service);
}(window, window.angular, window.jQuery, window.Rx));
