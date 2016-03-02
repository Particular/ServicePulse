; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/failedMessages', {
            data: {
                pageTitle: 'Failed Messages'
            },
            templateUrl: 'js/views/failed_messages/view.html',
            controller: 'failedMessagesController',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));