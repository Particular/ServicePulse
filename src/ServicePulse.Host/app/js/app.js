; (function (window, angular, $, undefined) {
    'use strict';

    angular.module('sc', [
        'ngRoute',
        'ngAnimate',
        'ngSanitize',
        'ngClipboard',
        'ngStorage',
        'ngPageTitle',
        'angular-momentjs',
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
        'dashboard',
        'ui.select']);

    angular.module('sc')
        .run(['$rootScope', '$location', '$log', function ($rootScope, $location, $log) {
            $rootScope.$log = $log;
        }]);

    angular.module('sc').value('$jquery', $);

}(window, window.angular, window.jQuery));