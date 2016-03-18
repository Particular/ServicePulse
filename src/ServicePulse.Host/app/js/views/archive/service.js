; (function (window, angular, undefined) {
    'use strict';



    function service($http, $timeout, $q, scConfig, uri) {

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

        return {

            getArchivedMessages: function (sort, page, direction, start, end) {

           
                var url = uri.join(scConfig.service_control_url, 'errors?status=archived&sort=modified&modified=2016-01-25T15:38:35.6767764Z...2016-11-25T15:38:36.6767764Z');

                return $http.get(url).then(function (response) {
                    return {
                        data: response.data,
                        total: response.headers('Total-Count')
                    };
                });
    
            },

            getArchivedCount: function () {

                var url = uri.join(scConfig.service_control_url, 'errors?status=archived');

                return $http.head(url).then(function (response) {
                    return response.headers('Total-Count');
                });
            },

            returnArchive: function (id, success, error) {
                var url = uri.join(scConfig.service_control_url, 'recoverability', 'groups', id, 'errors', 'retry');
                return postPromise(url, success, error);
            }
        };
    }

    service.$inject = ['$http', '$timeout', '$q', 'scConfig', 'uri'];

    angular.module('sc')
        .service('archivedMessageService', service);

})(window, window.angular);