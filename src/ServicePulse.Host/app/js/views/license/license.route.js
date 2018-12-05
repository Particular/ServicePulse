; (function (window, angular, undefined) {

    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/configuration',
        {
            redirectTo: '/configuration/license'
        }).when('/configuration/license', {
            data: {
                pageTitle: 'License'
            },
            templateUrl: 'js/views/license/license.html',
            controller: 'LicenseCtrl',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('license')
        .config(routeProvider);

} (window, window.angular));