; (function (window, angular, undefined) {
    'use strict';

    angular.module('services', [
        'services.streamService',
        'services.serviceControlService',
        'services.platformUpdateService',
        'services.semverService',
        'services.notifications',
        'services.exceptionHandler',
        'services.uri',
        'services.endpoints'
    ]);


} (window, window.angular));