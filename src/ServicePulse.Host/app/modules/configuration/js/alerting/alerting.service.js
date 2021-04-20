(function (window, angular) {
    'use strict';
    
    function service($http, $timeout, $q, $rootScope, $interval, moment, connectionsManager, uri, notifications, notifyService) {
        var notifier = notifyService();
        var scu = connectionsManager.getServiceControlUrl();

        var alerting = {};

        function getData() {
            var url = uri.join(scu, 'alerting');
            return $http.get(url).then(function (response) {
                alerting = response.data;

                notifier.notify('AlertingConfigurationUpdated', { alerting });
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
                        defer.reject({ message: error + ':' + response.statusText, status: response.status, statusText: response.statusText });
                    }
                );

            return defer.promise;
        }

        getData();

        return {
            updateSettings: function(settings, success, error) {
                var url = uri.join(scu, 'alerting');
                var promise = sendPromise(url, 'POST', settings, 
                () => {alerting = settings}, 
                error);

                return promise;
            },
            sendTestEmail: function(success, error) {
                var url = uri.join(scu, 'alerting/send-test-email');
                var promise = sendPromise(url, 'POST', {}, success, error);

                return promise;
            },
            getSettings: function() {
                return $q.when(alerting);
            }
        };
    }

    service.$inject = ['$http', '$timeout', '$q', '$rootScope', '$interval', 'moment', 'connectionsManager', 'uri', 'notifications', 'notifyService'];

    angular.module('configuration.alerting')
        .service('alertingService', service);

})(window, window.angular);