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
        'monitored_endpoints',
        'endpoint_details',
        'wrappers',
        'customChecks',
        'configuration',
        'dashboard',
        'ui.select',
        'prettyXml']);

    angular.module('sc')
        .run(['$rootScope', '$location', '$log', function ($rootScope, $location, $log) {
            $rootScope.$log = $log;
        }]);

    angular.module('sc').value('$jquery', $);

}(window, window.angular, window.jQuery));