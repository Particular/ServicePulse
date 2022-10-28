(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/failedMessages', {
            redirectTo: '/failed-messages/all'
        }).when('/failedMessages/:groupId',
            {
                redirectTo: '/failed-messages/groups/:groupId'
            })
            .when('/failed-messages/groups/:groupId', {
                data: {
                    pageTitle: 'Failed Messages'
                },
                templateUrl: 'js/views/failed_messages/failed-messages-view.html',
                controller: 'failedMessagesController',
                controllerAs: 'vm'
            }).when('/failed-messages/all', {
                data: {
                    pageTitle: 'Failed Messages'
                },
                templateUrl: 'js/views/failed_messages/failed-messages-view.html',
                controller: 'failedMessagesController',
                controllerAs: 'vm'
            });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));