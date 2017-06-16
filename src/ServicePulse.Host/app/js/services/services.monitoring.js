;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, scConfig, notifications, uri) {

        function getData() {
            var url = uri.join(scConfig.monitoring_url, '/data');
            return $http.get(url)
                .then(function (response) {
                    return response.data;
                })
                .catch(function(fallback) {
                    notifications.pushSticky('Can not connect to Monitoring Service');
                });
        }

        var service = {
            getData: getData
        };

        return service;
    }

    Service.$inject = ['$http', 'scConfig', 'notifications', 'uri'];

    angular.module('services.monitoringService', [])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));