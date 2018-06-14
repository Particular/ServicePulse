; (function (window, angular, undefined) {
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
        'services.messageTypeParser'
    ]);


} (window, window.angular));