;
(function (window, angular, $, undefined) {
    'use strict';

    function Service(toastService, scConfig) {

        var isConnectedToSourceIndex = Array(scConfig.monitoring_urls.length).fill(true);
        
        function reportFailedConnection(sourceIndex) {

            if (isConnectedToSourceIndex[sourceIndex]) {
                var message = 'Could not connect to the ServiceControl Monitoring service.';
                if (scConfig.monitoring_urls.length > 1) {
                    message = 'Could not connect to the ServiceControl Monitoring service at' + scConfig.monitoring_urls[sourceIndex] + '.';
                }
                toastService.showError(message);
            }
            isConnectedToSourceIndex[sourceIndex] = false;
        }

        function reportSuccessfulConnection(sourceIndex) {
            if (!isConnectedToSourceIndex[sourceIndex]) {
                var message = 'Connection to ServiceControl Monitoring service was successful.';
                if (scConfig.monitoring_urls.length > 1) {
                    message = 'Connection to ServiceControl Monitoring service was successful ' + scConfig.monitoring_urls[sourceIndex] +'.';
                }
                toastService.showInfo(message, 'Info', true);
            }
            isConnectedToSourceIndex[sourceIndex] = true;
        }

        var service = {
            reportFailedConnection: reportFailedConnection,
            reportSuccessfulConnection: reportSuccessfulConnection
        };

        return service;
    }

    Service.$inject = ['toastService', 'scConfig'];

    angular.module('services.connectivityNotifier', ['sc'])
        .service('connectivityNotifier', Service);
}(window, window.angular, window.jQuery));