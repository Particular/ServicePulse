(function () {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/customChecks', {
            templateUrl: 'js/custom_checks/customChecks.tpl.html',
            controller: 'CustomChecksCtrl'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('customChecks')
           .config(routeProvider);

})();