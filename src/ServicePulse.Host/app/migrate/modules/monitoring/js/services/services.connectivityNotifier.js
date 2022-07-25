(function (window, angular, $, Rx) {
    'use strict';

    function Service(toastService, connectionsManager, notifyService) {

        var notifier = notifyService();
        var mu = connectionsManager.getMonitoringUrl();
        var isConnected = false;
        var isConnecting = false;
        var connectivitySource = new Rx.Subject();
        var shouldShowFailedMessage = true;

        function reportFailedConnection() {

            if (isConnected) {
                var message = 'Could not connect to the ServiceControl Monitoring service at ' + mu + '. <a class="btn btn-default" href="#/configuration/connections">View connection settings</a>';
                console.log(message);
                if (shouldShowFailedMessage) {
                    toastService.showError(message);
                    shouldShowFailedMessage = false;
                }
            }
            isConnected = false;
            isConnecting = false;
            emitChange();
        }

        function reportSuccessfulConnection() {
            if (!isConnected) {
                var message = 'Connection to ServiceControl Monitoring service was successful ' + mu + '.';
                console.log(message);
                shouldShowFailedMessage = true;
            }
            isConnected = true;
            isConnecting = false;
            emitChange();
        }

        function reportConnecting() {
            isConnecting = true;
            emitChange();
        }

        function emitChange() {
            var result = {
                isConnected: isConnected,
                isConnecting: isConnecting
            };

            connectivitySource.onNext(result);

            notifier.notify('MonitoringConnectionStatusChanged', {
                isMonitoringConnected : isConnected,
                isMonitoringConnecting : isConnecting
            });
        }

        function getConnectionStatusSource() {
            return connectivitySource;
        }

        var service = {
            reportConnecting: reportConnecting,
            reportFailedConnection: reportFailedConnection,
            reportSuccessfulConnection: reportSuccessfulConnection,
            getConnectionStatusSource: getConnectionStatusSource,
        };
        

        return service;
    }

    Service.$inject = ['toastService', 'connectionsManager', 'notifyService'];

    angular.module('services.connectivityNotifier', ['sc'])
        .service('connectivityNotifier', Service);
})(window, window.angular, window.jQuery, window.Rx);
