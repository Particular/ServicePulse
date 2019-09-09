(function (window, angular) {

    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/endpoints', {
            data: {
                pageTitle: 'Endpoints'
            },
            templateUrl: 'js/views/endpoints/endpoints.html',
            controller: 'EndpointsCtrl',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('endpoints')
        .config(routeProvider);

} (window, window.angular));