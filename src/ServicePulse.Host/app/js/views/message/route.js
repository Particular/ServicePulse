; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/message/:messageId', {
            redirectTo: '/failed-messages/message/:messageId'
        }).when('/failed-messages/message/:messageId', {
            data: {
                pageTitle: 'Message'
            },
            templateUrl: 'js/views/message/messages-view.html',
            controller: 'messagesController',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));