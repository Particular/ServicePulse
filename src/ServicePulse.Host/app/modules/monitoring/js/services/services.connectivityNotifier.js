;
(function (window, angular, $, undefined) {
    'use strict';

    function Service(toastService, scConfig) {

        var isConnectedToSourceIndex = Array(scConfig.monitoring_urls.length).fill(true);
        var connectivitySource = new Rx.Subject();
        var shouldShowFailedMessage = true;

        function reportFailedConnection(sourceIndex) {

            if (isConnectedToSourceIndex[sourceIndex]) {
                var message = 'Could not connect to the ServiceControl Monitoring service.';
                if (scConfig.monitoring_urls.length > 1) {
                    message = 'Could not connect to the ServiceControl Monitoring service at' + scConfig.monitoring_urls[sourceIndex] + '.';
                }
                console.log(message);
                if (shouldShowFailedMessage) {
                    toastService.showError(message);
                    shouldShowFailedMessage = false;
                }
            }
            isConnectedToSourceIndex[sourceIndex] = false;
            emitChange(isConnectedToSourceIndex);
        }

        function reportSuccessfulConnection(sourceIndex) {
            if (!isConnectedToSourceIndex[sourceIndex]) {
                var message = 'Connection to ServiceControl Monitoring service was successful.';
                if (scConfig.monitoring_urls.length > 1) {
                    message = 'Connection to ServiceControl Monitoring service was successful ' + scConfig.monitoring_urls[sourceIndex] +'.';
                }
                console.log(message);
                shouldShowFailedMessage = true;
            }
            isConnectedToSourceIndex[sourceIndex] = true;
            emitChange(isConnectedToSourceIndex);
        }

        function emitChange(connectedToSourceIndex) {
            var result = connectedToSourceIndex.every(item => item);
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

    Service.$inject = ['toastService', 'scConfig'];

    angular.module('services.connectivityNotifier', ['sc'])
        .service('connectivityNotifier', Service);
}(window, window.angular, window.jQuery));