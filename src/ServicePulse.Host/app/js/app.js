(function (window, angular, undefined) {
    'use strict';

    angular.module('sc', [
        'ngRoute',
        'ngAnimate',
        'ngSanitize',
        'ngClipboard',
        'ui.bootstrap',
        'infinite-scroll',
        'services.streamService',
        'services.serviceControlService',
        'services.platformUpdateService',
        'services.semverService',
        'services.notifications',
        'services.exceptionHandler',
        'ui.particular',
        'directives.moment',
        'directives.hud',
        'directives.eatClick',
        'directives.productVersion',
        'eventLogItems',
        'failedMessages',
        'endpoints',
        'customChecks',
        'configuration',
        'dashboard']);

    angular.module('sc')
        .run(['$rootScope', '$log', function ($rootScope, $log) {
            $rootScope.$log = $log;
        }]);

}(window, window.angular));