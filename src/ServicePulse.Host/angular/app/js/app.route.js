(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.otherwise({ redirectTo: window.defaultConfig.default_route });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

} (window, window.angular));