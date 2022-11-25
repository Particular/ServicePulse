(function (window, angular) {
    'use strict';
    
    function service($http, $timeout, $q, $rootScope, $interval, moment, connectionsManager, uri, notifications, notifyService) {
        var notifier = notifyService();
        var scu = connectionsManager.getServiceControlUrl();

        var redirects = {
            total :0,
            data: []
        };

        function getData() {
            var url = uri.join(scu, 'redirects');
            return $http.get(url).then(function (response) {
                redirects.data = response.data;
                redirects.data.forEach(function(item) {
                    item.last_modified = moment.utc(item.last_modified).local().format('YYYY-MM-DDTHH:mm:ss');
                });
                redirects.total = response.headers('Total-Count');
                notifier.notify('RedirectsUpdated', { total: redirects.total, data: redirects.data });
                notifier.notify('RedirectMessageCountUpdated', redirects.total);
            });
        }

        notifier.subscribe($rootScope, function (event, response) {
            response.last_modified = moment().format('YYYY-MM-DDTHH:mm:ss');
            redirects.data.push(response);
            redirects.total++;
            notifier.notify('RedirectsUpdated', { total: redirects.total, data: redirects.data });
            notifier.notify('RedirectMessageCountUpdated', redirects.total);
        }, "MessageRedirectCreated");

        notifier.subscribe($rootScope, function (event, response) {
            var previousRedirect = redirects.data.filter(function (redirect) {
                return redirect.message_redirect_id === response.message_redirect_id;
            });

            if (previousRedirect.length === 1) {
                previousRedirect[0].to_physical_address = response.to_physical_address;
                notifier.notify('RedirectsUpdated', { total: redirects.total, data: redirects.data });
            }
        }, "MessageRedirectChanged");

        notifier.subscribe($rootScope, function (event, response) {
            var redirectToBeDeleted = redirects.data.filter(function (redirect) {
                return redirect.message_redirect_id === response.message_redirect_id;
            });

            redirects.total--;
            notifier.notify('RedirectMessageCountUpdated', redirects.total);

            if (redirectToBeDeleted.length === 1) {
                redirects.data.splice(redirects.data.indexOf(redirectToBeDeleted[0]), 1);
                notifier.notify('RedirectsUpdated', { total: redirects.total, data: redirects.data });
            }
        }, "MessageRedirectRemoved");
        
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

        getData();

        return {
            createRedirect: function(sourceEndpoint, targetEndpoint, success, error) {
                var url = uri.join(scu, 'redirects');
                var promise = sendPromise(url,
                    'POST',
                    { "fromphysicaladdress": sourceEndpoint, "tophysicaladdress": targetEndpoint },
                    success,
                    error);

                return promise;
            },
            updateRedirect: function(redirectId, sourceEndpoint, targetEndpoint, success, error) {
                var url = uri.join(scu, 'redirects', redirectId);
                var promise = sendPromise(url,
                    'PUT',
                    { "id": redirectId, "fromphysicaladdress": sourceEndpoint, "tophysicaladdress": targetEndpoint },
                    success,
                    error);

                return promise;
            },
            deleteRedirect: function(id, success, error) {
                var url = uri.join(scu, 'redirects', id);
                return $http.delete(url)
                    .then(function() {
                            notifications.pushForCurrentRoute(success, 'info');
                        },
                        function() {
                            notifications.pushForCurrentRoute(error, 'danger');
                        });
            },
            getTotalRedirects: function() {
                return $q.when(redirects.total);
            },
            getRedirects: function() {
                return $q.when(redirects);
            }
        };
    }

    service.$inject = ['$http', '$timeout', '$q', '$rootScope', '$interval', 'moment', 'connectionsManager', 'uri', 'notifications', 'notifyService'];

    angular.module('configuration.redirect')
        .service('redirectService', service);

})(window, window.angular);