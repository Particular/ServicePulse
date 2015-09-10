(function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/customChecks', {
            templateUrl: 'js/custom_checks/customChecks.html',
            controller: 'CustomChecksCtrl',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('customChecks')
           .config(routeProvider);

}(window, window.angular));