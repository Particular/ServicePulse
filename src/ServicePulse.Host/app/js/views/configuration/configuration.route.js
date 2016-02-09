; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/configuration', {
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