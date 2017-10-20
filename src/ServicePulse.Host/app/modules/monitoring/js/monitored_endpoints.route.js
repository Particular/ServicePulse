(function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        let template = require('./../views/monitored_endpoints.html');
        debugger;

        $routeProvider.when('/monitored_endpoints', {
            data: {
                pageTitle: 'Monitored Endpoints'
            },
            template: template,
            //templateUrl: './monitored_endpoints.html',
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