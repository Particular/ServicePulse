;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri, $q) {

        function createEndpointsSource(historyPeriod) {
            return Rx.Observable.interval(5000)
                .flatMap(function (i) {
                    return Rx.Observable.fromPromise(loadEndpointDataFromMonitoringService(observer, historyPeriod));
                }).selectMany(function (endpoints) {
                    return endpoints;
                });
        }

        function loadEndpointDataFromMonitoringService(observer, historyPeriod) {
            scConfig.monitoring_urls.forEach(function (url) {
                $http.get(uri.join(url, 'monitored-endpoints') + '?history=' + historyPeriod)
                    .then(function (result) {
                        var sourceIndex = scConfig.monitoring_urls.indexOf(url);

                        result.data.forEach(function (endpoint) {
                            endpoint.sourceIndex = sourceIndex;
                        });

                        observer.onNext(result.data);
                    });
            });
        }

        function loadEndpointDetailsFromMonitoringService(observer, endpointName, sourceIndex, historyPeriod) {
            $http.get(uri.join(scConfig.monitoring_urls[sourceIndex], 'monitored-endpoints', endpointName) + "?history=" + historyPeriod)
                .then(function (result) {
                    observer.onNext(result.data);
                }, function (error) {
                    observer.onNext({ error: error });
                });
        }

        function createEndpointDetailsSource(endpointName, sourceIndex, historyPeriod) {
            return Rx.Observable.interval(5000)
                .flatMap(function (i) {
                    return Rx.Observable.fromPromise(loadEndpointDetailsFromMonitoringService(observer, endpointName, sourceIndex, historyPeriod));
                });
        }

        function getHistoryPeriod() {
            return historyPeriod;
        }

        var service = {
            createEndpointsSource: createEndpointsSource,
            createEndpointDetailsSource: createEndpointDetailsSource
        };

        return service;
    }

    Service.$inject = ['$http', 'rx', 'scConfig', 'uri', '$q'];

    angular.module('services.monitoringService', ['sc'])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));