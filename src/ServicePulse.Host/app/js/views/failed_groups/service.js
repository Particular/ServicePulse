; (function (window, angular, undefined) {
    'use strict';



    function service($http, $timeout, $q, scConfig, uri) {

        function postPromise(url, success, error) {

            var defer = $q.defer();

            success = success || 'success';
            error = error || 'error';

            $http.post(url)
                .then(function (response) {
                    defer.resolve(success + ':' + response);
                }, function (response) {
                    defer.reject(error + ':' + response);
                });

            return defer.promise;
        }

        return {
           
            retryGroup: function (id, success, error) {
                var url = uri.join(scConfig.service_control_url, 'recoverability', 'groups', id, 'errors', 'retry');
                return postPromise(url, success, error);
            },
            archiveGroup: function (id, success, error) {
                var url = uri.join(scConfig.service_control_url, 'recoverability', 'groups', id, 'errors', 'archive');
                return postPromise(url, success, error);
            }
        };
    }

    service.$inject = ['$http', '$timeout', '$q', 'scConfig', 'uri'];

    angular.module('sc')
        .service('failedMessageGroupsService', service);

})(window, window.angular);