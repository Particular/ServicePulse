; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/redirects', {
            redirectTo: "/configuration/redirects"
        }).when('/configuration/redirects', {
            data: {
                pageTitle: 'Retry Redirects - Configuration'
            },
            templateUrl: 'js/views/redirect/view.html',
            controller: 'redirectController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));
