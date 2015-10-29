; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/configuration', {
            templateUrl: 'js/configuration/configuration.html',
            controller: 'ConfigurationCtrl',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('configuration')
        .config(routeProvider);

} (window, window.angular));