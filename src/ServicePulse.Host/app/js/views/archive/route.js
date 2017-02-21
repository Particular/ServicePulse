; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/archived', {
            redirectTo: '/failed-messages/archived'
        }).when('/failed-messages/archived', {
            data: {
                pageTitle: 'Archived Messages'
            },
            templateUrl: 'js/views/archive/view.html',
            controller: 'archivedMessageController',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));