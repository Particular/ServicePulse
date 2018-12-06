; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        const template = require('../../views/license.html');

        $routeProvider.when('/configuration/license', {
            data: {
                pageTitle: 'License - Configuration'
            },
            template: template,
            controller: 'licenseController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('configuration.license', [])
        .config(routeProvider);

} (window, window.angular));
