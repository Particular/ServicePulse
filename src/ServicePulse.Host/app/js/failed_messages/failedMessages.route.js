(function () {
    'use strict';

    function routeProvider ($routeProvider) {
        $routeProvider.when('/failedMessages', {
            templateUrl: 'js/failed_messages/failedMessages.tpl.html',
            controller: 'FailedMessagesCtrl'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('failedMessages')
           .config(routeProvider);

})();