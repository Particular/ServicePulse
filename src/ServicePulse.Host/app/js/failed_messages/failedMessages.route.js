(function () {
    'use strict';

    angular.module('failedMessages')
           .config(['$routeProvider', function ($routeProvider) {
               $routeProvider.when('/failedMessages', {
                   templateUrl: 'js/failed_messages/failedMessages.tpl.html',
                   controller: 'FailedMessagesCtrl'
               });
           }
           ]);

})();