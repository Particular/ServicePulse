; (function (window, angular, undefined) { 'use strict';

    function Service($http, $timeout, $q, scConfig) {

        function getData() { }


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

        function postPromise(url, success, error) {

            var defer = $q.defer();

            success = success || 'success';
            error = error || 'error';

            $http.post(url)
                .success(function (response) {
                    defer.resolve(success + ':' + response);
                })
                .error(function (response) {
                    defer.reject(error + ':' + response);
                });

            return defer.promise;
        }

        var service = {
            getData: getData,
            retryGroup: function(id, success, error) {
                return postPromise(scConfig.service_control_url + '/recoverability/groups/' + id + '/errors/retry', success, error);
            },
            archiveGroup: function (id, success, error) {
                return postPromise(scConfig.service_control_url + '/recoverability/groups/' + id + '/errors/archive', success, error);
            },
            wait: wait
        };

        return service;

    }

    Service.$inject = ['$http', '$timeout', '$q', 'scConfig'];

    angular.module('failedMessages')
        .factory('failedMessagesService', Service);


}(window, window.angular));