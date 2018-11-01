(function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        let template = require('./../views/monitored_endpoints.html');

        $routeProvider.when('/monitoring', {
            data: {
                pageTitle: 'Monitored Endpoints'
            },
            template: template,
            controller: 'monitoredEndpointsCtrl',
            controllerAs: 'vm',
            reloadOnSearch: false
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('monitored_endpoints')
        .config(routeProvider);
} (window, window.angular));