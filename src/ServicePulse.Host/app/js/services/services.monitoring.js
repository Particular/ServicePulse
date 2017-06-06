;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, scConfig, notifications, uri) {

        function getMetrics() {
            var url = uri.join(scConfig.monitoring_url, 'metrics');
            return $http.get(url).then(function (response) {
                return response.data;
            });
        }

        var service = {
            getMetrics: getMetrics
        };

        return service;
    }

    Service.$inject = ['$http', 'scConfig', 'notifications', 'uri'];

    angular.module('services.monitoringService', [])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));