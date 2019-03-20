;
(function (window, angular, $, undefined) {
    'use strict';

    function Service(toastService, connectionsFactory) {

        var mu = connectionsFactory.getMonitoringUrl();
        var isConnected = true;
        var connectivitySource = new Rx.Subject();
        var shouldShowFailedMessage = true;

        function reportFailedConnection() {

            if (isConnected) {
                var message = 'Could not connect to the ServiceControl Monitoring service at' + mu + '.';
                console.log(message);
                if (shouldShowFailedMessage) {
                    toastService.showError(message);
                    shouldShowFailedMessage = false;
                }
            }
            isConnected = false;
            emitChange(isConnected);
        }

        function reportSuccessfulConnection() {
            if (!isConnected) {
                var message = 'Connection to ServiceControl Monitoring service was successful ' + mu + '.';
                console.log(message);
                shouldShowFailedMessage = true;
            }
            isConnected = true;
            emitChange(isConnected);
        }

        function emitChange(connected) {
            var result = connected;
            connectivitySource.onNext(result);
        };

        function getConnectionStatusSource() {
            return connectivitySource;
        }

        var service = {
            reportFailedConnection: reportFailedConnection,
            reportSuccessfulConnection: reportSuccessfulConnection,
            getConnectionStatusSource: getConnectionStatusSource,
        };
        

        return service;
    }

    Service.$inject = ['toastService', 'connectionsFactory'];

    angular.module('services.connectivityNotifier', ['sc'])
        .service('connectivityNotifier', Service);
}(window, window.angular, window.jQuery));