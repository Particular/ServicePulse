(function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/endpoint_details/:endpointName/:sourceIndex', {
            data: {
                pageTitle: 'Endpoint Details'
            },
            templateUrl: 'js/views/endpoint_details/endpoint_details.html',
            controller: 'endpointDetailsCtrl',
            controllerAs: 'vm',
            reloadOnSearch: false
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('endpoint_details')
        .config(routeProvider);
} (window, window.angular));