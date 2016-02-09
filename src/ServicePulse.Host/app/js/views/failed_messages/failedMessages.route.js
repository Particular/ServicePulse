;(function (window, angular, undefined) { 'use strict';

    function routeProvider ($routeProvider) {
        $routeProvider.when('/failedMessages', {
            templateUrl: 'js/views/failed_messages/failedMessages.html',
            controller: 'FailedMessagesCtrl',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('failedMessages')
           .config(routeProvider);


}(window, window.angular));