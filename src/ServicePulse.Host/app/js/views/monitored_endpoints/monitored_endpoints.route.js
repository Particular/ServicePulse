(function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/monitored_endpoints', {
            data: {
                pageTitle: 'Monitored Endpoints'
            },
            templateUrl: 'js/views/monitored_endpoints/monitored_endpoints.html',
            controller: 'monitoredEndpointsCtrl',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('monitored_endpoints')
        .config(routeProvider);
} (window, window.angular));