; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider, scConfig) {
        $routeProvider.otherwise({ redirectTo: scConfig.default_route });
    };

    routeProvider.$inject = [
        '$routeProvider',
        'scConfig'
    ];

    angular.module('sc')
        .config(routeProvider);

} (window, window.angular));