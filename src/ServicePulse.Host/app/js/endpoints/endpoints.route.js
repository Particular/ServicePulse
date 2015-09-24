; (function (window, angular, undefined) {

    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/endpoints', {
            templateUrl: 'js/endpoints/endpoints.html',
            controller: 'EndpointsCtrl',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('endpoints')
        .config(routeProvider);

} (window, window.angular));