(function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/monitored-endpoints', {
            data: {
                pageTitle: 'Monitored Endpoints'
            },
            templateUrl: 'js/views/monitored-endpoints/monitored-endpoints.html',
            controller: 'monitoredEndpointsCtrl',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('monitored-endpoints')
        .config(routeProvider);
} (window, window.angular));