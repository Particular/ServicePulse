(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        let template = require('./../views/endpoint_details.html');

        $routeProvider.when('/monitoring/endpoint/:endpointName', {
            data: {
                pageTitle: 'Endpoint Details'
            },
            template: template,
            controller: 'endpointDetailsCtrl',
            controllerAs: 'vm',
            reloadOnSearch: false
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('endpoint_details')
        .config(routeProvider);
} (window, window.angular));