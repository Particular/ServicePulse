; (function (window, angular, undefined) {
    'use strict';
    
    function service($http, $timeout, $q, $rootScope, $interval, scConfig, uri, notifications, notifyService) {
        var notifier = notifyService();

        var redirects = {
            total :0,
            data: []
        };

        function getData() {
            var url = uri.join(scConfig.service_control_url, 'redirects');
            return $http.get(url).then(function (response) {
                notifier.notify('RedirectsUpdated', { total: response.headers('Total-Count'), data: response.data });
                notifier.notify('RedirectMessageCountUpdated', response.headers('Total-Count'));
            });
        }

        var redirectsUpdatedTimer = $interval(function () {
            getData();
        }, 15000);

        // Cancel interval on page changes
        $rootScope.$on('$destroy', function () {
            if (angular.isDefined(redirectsUpdatedTimer)) {
                $interval.cancel(redirectsUpdatedTimer);
                redirectsUpdatedTimer = undefined;
            }
        });

        notifier.subscribe($rootScope, function (event, response) {
            redirects.data = response.data;
            redirects.total = response.total;
        }, 'RedirectsUpdated');

        function sendPromise(url, method, data, success, error) {

            var defer = $q.defer();

            success = success || 'success';
            error = error || 'error';

            $http({
                    url: url,
                    data: data,
                    method: method
                })
                .then(function(response) {
                        defer.resolve({ message: success, status: response.status });
                    }, function(response) {
                        defer.reject({ message: error + ':' + response.statusText, status: response.status, statusText: response.statusText });
                    }
                );

            return defer.promise;
        }

        return {
            createRedirect: function (sourceEndpoint, targetEndpoint, success, error) {
                var url = uri.join(scConfig.service_control_url, 'redirects');
                var promise = sendPromise(url, 'POST', { "fromphysicaladdress": sourceEndpoint, "tophysicaladdress": targetEndpoint }, success, error);
                promise.then(function() {
                    getData();
                });

                return promise;
            },
            updateRedirect: function (redirectId, sourceEndpoint, targetEndpoint, success, error) {
                var url = uri.join(scConfig.service_control_url, 'redirects', redirectId);
                var promise = sendPromise(url, 'PUT', { "id": redirectId, "fromphysicaladdress": sourceEndpoint, "tophysicaladdress": targetEndpoint }, success, error);
                promise.then(function () {
                    getData();
                });

                return promise;
            },
            deleteRedirect: function (id, success, error) {
                var url = uri.join(scConfig.service_control_url, 'redirects', id);
                return $http.delete(url)
                    .success(function() {
                        notifications.pushForCurrentRoute(success, 'info');
                        getData();
                    })
                    .error(function () {
                        notifications.pushForCurrentRoute(error, 'danger');
                });
            },
            getTotalRedirects: function() {
                return redirects.total;
            },
            getRedirects: function() {
                return redirects;
            }
        };
    }

    service.$inject = ['$http', '$timeout', '$q', '$rootScope', '$interval', 'scConfig', 'uri', 'notifications', 'notifyService'];

    angular.module('sc')
        .service('redirectService', service);

})(window, window.angular);