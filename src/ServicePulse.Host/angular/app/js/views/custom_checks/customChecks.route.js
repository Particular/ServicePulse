(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/customChecks', {
            redirectTo: '/custom-checks'
        }).when('/custom-checks', {
            data: {
                pageTitle: 'Custom Checks'
            },
            templateUrl: 'js/views/custom_checks/customChecks.html',
            controller: 'CustomChecksCtrl',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('customChecks')
           .config(routeProvider);

}(window, window.angular));
