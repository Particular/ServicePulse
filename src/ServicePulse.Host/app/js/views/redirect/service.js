; (function (window, angular, undefined) {
    'use strict';



    function service($http, $timeout, $q, scConfig, uri, notifications) {

        function postPromise(url, data, success, error) {

            var defer = $q.defer();

            success = success || 'success';
            error = error || 'error';

            $http({
                url: url,
                data: data,
                method: 'POST'
            })
                .success(function (response) {
                    defer.resolve(success + ':' + response);
                })
                .error(function (response) {
                    defer.reject(error + ':' + response);
                });

            return defer.promise;
        }

        return {
           
            createRedirect: function (sourceEndpoint, targetEndpoint, success, error) {
                var url = uri.join(scConfig.service_control_url, 'redirects');
                return postPromise(url, { "sourceEndpoint": sourceEndpoint, "targetEndpoint": targetEndpoint }, success, error);
            },
            updateRedirect: function (redirectId, sourceEndpoint, targetEndpoint, success, error) {
                var url = uri.join(scConfig.service_control_url, 'redirects');
                return postPromise(url, { "id": redirectId, "sourceEndpoint": sourceEndpoint, "targetEndpoint": targetEndpoint }, success, error);
            },
            deleteRedirect: function (id, success, error) {
                var url = uri.join(scConfig.service_control_url, 'redirects', id);
                $http.delete(url)
                    .success(function() {
                        notifications.pushForCurrentRoute(success, 'info');
                    })
                    .error(function () {
                        notifications.pushForCurrentRoute(error, 'danger');
                });
            },
            getTotalRedirects: function() {
                var url = uri.join(scConfig.service_control_url, 'redirects');
                return $http.head(url).then(function(response) {
                    return response.headers('Total-Count');
                });
            }
        };
    }

    service.$inject = ['$http', '$timeout', '$q', 'scConfig', 'uri', 'notifications'];

    angular.module('sc')
        .service('redirectService', service);

})(window, window.angular);