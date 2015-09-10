;(function (window, angular, undefined) { 'use strict';

    function Service($http, $timeout, $q, scService) {

        function getData() { }

        function retry() { }

        function wait() {

            var defer = $q.defer();

            // simulated async function
            $timeout(function() {
                if (Math.round(Math.random())) {
                    defer.resolve('data received!');
                } else {
                    defer.reject('oh no an error! try again');
                }
            }, 3000);

            return defer.promise;

        }

        var service = {
            getData: getData,
            retry: retry,
            wait: wait
        };

        return service;

    }

    Service.$inject = ['$http', '$timeout', '$q', 'serviceControlService' ];

    angular.module('failedMessages')
        .factory('failedMessagesService', Service);


}(window, window.angular));