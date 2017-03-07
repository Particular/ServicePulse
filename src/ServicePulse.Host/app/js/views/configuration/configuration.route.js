; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/configuration',
        {
            redirectTo: '/configuration/endpoints'
        }).when('/configuration/endpoints', {
            data: {
                pageTitle: 'Monitored endpoints - Configuration'
            },
            templateUrl: 'js/views/configuration/configuration.html',
            controller: 'ConfigurationCtrl',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('configuration.route', [])
        .config(routeProvider);

} (window, window.angular));