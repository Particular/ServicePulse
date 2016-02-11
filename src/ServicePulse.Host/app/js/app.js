; (function (window, angular, $, undefined) {
    'use strict';

    angular.module('sc', [
        'ngRoute',
        'ngAnimate',
        'ngSanitize',
        'ngClipboard',
        'ngStorage',
        'toaster',
        'ui.bootstrap',
        'infinite-scroll',
        'services',
        'ui.particular',
        'directives.moment',
        'eventLogItems',
        'endpoints',
        'customChecks',
        'configuration',
        'dashboard']);

    angular.module('sc')
        .run(['$rootScope', '$log', function ($rootScope, $log) {
            $rootScope.$log = $log;
        }]);

    angular.module('sc').value('$jquery', $);

}(window, window.angular, window.jQuery));