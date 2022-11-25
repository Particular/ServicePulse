(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        const template = require('../../views/platformconnection.html');

        $routeProvider.when('/configuration/platformconnection', {
            data: {
                pageTitle: 'Endpoint connection'
            },
            template: template,
            controller: 'platformConnectionController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('configuration.platformconnection', [])
        .config(routeProvider);

}(window, window.angular));
