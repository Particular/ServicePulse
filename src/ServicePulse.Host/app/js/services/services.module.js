(function (window, angular) {
    'use strict';

    angular.module('services', [
        'services.streamService',
        'services.serviceControlService',
        'services.monitoringService',
        'services.connectivityNotifier',
        'services.platformUpdateService',
        'services.semverService',
        'services.notifications',
        'services.exceptionHandler',
        'services.uri',
        'services.endpoints',
        'services.messageTypeParser',
        'services.disconnectedEndpointMonitor',
        'services.export'
    ]);

} (window, window.angular));