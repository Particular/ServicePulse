; (function (window, angular, undefined) {
    
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'js/views/dashboard/dashboard.html',
            controller: 'DashboardCtrl',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('dashboard')
        .config(routeProvider);

} (window, window.angular));