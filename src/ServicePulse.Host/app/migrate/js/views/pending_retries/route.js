(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/pendingRetries', {
            redirectTo: '/failed-messages/pending-retries'
        }).when('/failed-messages/pending-retries', {
            data: {
                pageTitle: 'Pending Retries'
            },
            templateUrl: 'js/views/pending_retries/pending-retries-view.html',
            controller: 'pendingRetriesController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));
