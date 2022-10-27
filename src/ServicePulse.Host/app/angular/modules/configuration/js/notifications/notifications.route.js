(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        const template = require('../../views/notifications.html');

        $routeProvider.when('/notifications', {
            redirectTo: "/configuration/notifications"
        }).when('/configuration/notifications', {
            data: {
                pageTitle: 'Health check Notifications - Configuration'
            },
            template: template,
            controller: 'notificationsController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('configuration.notifications', [])
        .config(routeProvider);

}(window, window.angular));
