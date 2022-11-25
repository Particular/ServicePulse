(function (window, angular) {
    'use strict';

    function service($http, $timeout, $q, $rootScope, $interval, moment, connectionsManager, uri, notifications, notifyService) {
        var notifier = notifyService();
        var scu = connectionsManager.getServiceControlUrl();

        notifications = {};

        function getData() {
            var url = uri.join(scu, 'notifications/email');
            return $http.get(url).then(function (response) {
                notifications = response.data;

                notifier.notify('NotificationsConfigurationUpdated', { notifications });
            });
        }

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
                        defer.reject({ message: error + ':' + response.statusText, status: response.status, statusText: response.statusText, data: response.data });
                    }
                );

            return defer.promise;
        }

        getData();

        return {
            updateSettings: function(settings, success, error) {
                var url = uri.join(scu, 'notifications/email');
                var promise = sendPromise(url, 'POST', settings,
                () => {notifications = settings},
                error);

                return promise;
            },
            testEmailNotifications: function(success, error) {
                var url = uri.join(scu, 'notifications/email/test');
                var promise = sendPromise(url, 'POST', {}, success, error);

                return promise;
            },
            toogleEmailNotifications: function(enabled, success, error) {
                var url = uri.join(scu, 'notifications/email/toggle');

                var promise = sendPromise(url, 'POST', {'enabled': enabled}, success, error);

                return promise;
            },
            getSettings: function() {
                return $q.when(notifications);
            }
        };
    }

    service.$inject = ['$http', '$timeout', '$q', '$rootScope', '$interval', 'moment', 'connectionsManager', 'uri', 'notifications', 'notifyService'];

    angular.module('configuration.notifications')
        .service('notificationsService', service);

})(window, window.angular);