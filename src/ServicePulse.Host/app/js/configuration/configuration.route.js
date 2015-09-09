(function () {
    'use strict';


    function routeProvider($routeProvider) {
        $routeProvider.when('/configuration', {
            templateUrl: 'js/configuration/configuration.tpl.html',
            controller: 'ConfigurationCtrl'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('configuration')
           .config(routeProvider);


})();