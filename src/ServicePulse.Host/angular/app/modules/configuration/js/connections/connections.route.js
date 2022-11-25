(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        const template = require('../../views/connections.html');

        $routeProvider.when('/connections', {
            redirectTo: "/configuration/connections"
        }).when('/configuration/connections', {
            data: {
                pageTitle: 'Connections - Configuration'
            },
            template: template,
            controller: 'connectionsController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('configuration.connections', [])
        .config(routeProvider);

}(window, window.angular));
