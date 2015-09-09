(function () {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.otherwise({ redirectTo: '/dashboard' });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
         .config(routeProvider);

})();