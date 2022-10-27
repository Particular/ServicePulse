(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        const template = require('../../views/redirect.html');

        $routeProvider.when('/redirects', {
            redirectTo: "/configuration/redirects"
        }).when('/configuration/redirects', {
            data: {
                pageTitle: 'Retry Redirects - Configuration',
                redirectWhenNotConnected: '/configuration/connections'
            },
            template: template,
            controller: 'redirectController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('configuration.redirect', [])
        .config(routeProvider);

}(window, window.angular));
