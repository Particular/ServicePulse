(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/configuration', {
                redirectTo: "/configuration/license"
            });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('configuration.route', [])
        .config(routeProvider); 

} (window, window.angular));