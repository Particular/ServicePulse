(function() {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/endpoints', {
            templateUrl: 'js/endpoints/endpoints.tpl.html',
            controller: 'EndpointsCtrl'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('endpoints')
        .config(routeProvider);

})();