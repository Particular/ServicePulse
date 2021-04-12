(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        const template = require('../../views/alerting.html');

        $routeProvider.when('/alerting', {
            redirectTo: "/configuration/alerting"
        }).when('/configuration/alerting', {
            data: {
                pageTitle: 'Alerting - Configuration'
            },
            template: template,
            controller: 'alertingController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('configuration.alerting', [])
        .config(routeProvider);

}(window, window.angular));
