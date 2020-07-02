(function (window, angular, $, Rx) {
    'use strict';

    function Service(notifyService, monitoringService, $log, $rootScope) {
        var disconnectedEndpointsUpdatedEvent = "DisconnectedEndpointsUpdated";

        var notifier = notifyService();

        var checkDisconnectedCount = function ()
        {
            monitoringService.getDisconnectedCount().then(result => {
                notifier.notify(disconnectedEndpointsUpdatedEvent, result.data);
            }, e => {
                $log.debug('Error while getting disconnected endpoints count from monitoring:' + e);
            });
        };

        var checkInterval;
        var isConnected = false;

        notifier.subscribe($rootScope, (event, data) => {
            if (data.isMonitoringConnected && isConnected == false) {
                checkDisconnectedCount();
                checkInterval = setInterval(checkDisconnectedCount, 20000);
                isConnected = true;
            } else if (!data.isMonitoringConnected && isConnected) {
                isConnected = false;
                clearInterval(checkInterval);
            }
        }, "MonitoringConnectionStatusChanged")

        var service = {
            EventPublished: disconnectedEndpointsUpdatedEvent
        };

        return service;
    }

    Service.$inject = ['notifyService', 'monitoringService', '$log', '$rootScope'];

    angular.module('services.disconnectedEndpointMonitor', ['sc'])
        .service('disconnectedEndpointMonitor', Service);
}(window, window.angular, window.jQuery, window.Rx));
