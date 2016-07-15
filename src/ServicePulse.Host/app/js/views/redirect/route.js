; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/redirects', {
            data: {
                pageTitle: 'Retry Redirects'
            },
            templateUrl: 'js/views/redirect/view.html',
            controller: 'redirectController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));