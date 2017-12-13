﻿;
(function (window, angular, $, undefined) {
    'use strict';

    function Service(toastService) {

        var isConnected = true;
        function reportFailedConnection() {
            if (isConnected) {
                toastService.showError('Could not connect to SC Monitoring service.');
            }
            isConnected = false;
        }

        function reportSuccessfulConnection() {
            if (!isConnected) {
                toastService.showInfo('Connection to SC Monitoring service was successful', 'Info', true);
            }
            isConnected = true;
        }

        var service = {
            reportFailedConnection: reportFailedConnection,
            reportSuccessfulConnection: reportSuccessfulConnection
        };

        return service;
    }

    Service.$inject = ['toastService'];

    angular.module('services.connectivityNotifier', ['sc'])
        .service('connectivityNotifier', Service);
}(window, window.angular, window.jQuery));