; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/failedMessages/:messageId', {
            data: {
                pageTitle: 'Message'
            },
            templateUrl: 'js/views/message/view.html',
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