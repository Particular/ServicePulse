(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        const template = require('../../views/license.html');

        $routeProvider.when('/configuration/license', {
            data: {
                pageTitle: 'License - Configuration',
                redirectWhenNotConnected: '/configuration/connections'
            },
            template: template,
            controller: 'LicenseController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];
    
    angular.module('configuration.license', [])
        .config(routeProvider);

} (window, window.angular));