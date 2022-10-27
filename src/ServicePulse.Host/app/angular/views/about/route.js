(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/about', {
            data: {
                pageTitle: 'About'
            },
            templateUrl: 'angular/views/about/about-view.html',
            controller: 'aboutController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));