(function () {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'js/dashboard/dashboard.tpl.html',
            controller: 'DashboardCtrl'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('dashboard')
           .config(routeProvider);
   
})();