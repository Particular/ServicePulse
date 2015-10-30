;
(function(window, angular, undefined) {
    'use strict';

    function Service($http, $timeout, $q, scConfig, uri) {

        function getData() {}


        function notify_loop(notify, done, index, length, waitTime) {

            length = length || 10;
            waitTime = waitTime || 500;

            setTimeout(function() {
                index++;
                if (index < length) {
                    notify(index);
                    notify_loop(notify, done, index, length, waitTime);
                } else {
                    done();
                }
            }, waitTime);
        };


        function wait() {

            var defer = $q.defer();

            // simulated async function
            $timeout(function() {
                if (Math.round(Math.random())) {
                    //  we are working now

                    var index = 0;
                    notify_loop(
                        function (progress) {
                             defer.notify(progress);
                        },
                        function() {
                             defer.resolve('data received!');
                        },
                        index);
                 
                    

                } else {
                    defer.reject('oh no an error! try again');
                }
            }, 1000);

            return defer.promise;

        }

        function postPromise(url, success, error) {

            var defer = $q.defer();

            success = success || 'success';
            error = error || 'error';

            $http.post(url)
                .success(function(response) {
                    defer.resolve(success + ':' + response);
                })
                .error(function(response) {
                    defer.reject(error + ':' + response);
                });

            return defer.promise;
        }

        var service = {
            getData: getData,
            retryGroup: function (id, success, error) {
                var url = uri.join(scConfig.service_control_url, 'recoverability', 'groups', id, 'errors', 'retry');
                return postPromise(url, success, error);
            },
            archiveGroup: function(id, success, error) {
                var url = uri.join(scConfig.service_control_url, 'recoverability', 'groups', id, 'errors', 'archive');
                return postPromise(url, success, error);
            },
            wait: wait
        };

        return service;

    }

    Service.$inject = ['$http', '$timeout', '$q', 'scConfig', 'uri'];

    angular.module('failedMessages')
        .factory('failedMessagesService', Service);


}(window, window.angular));