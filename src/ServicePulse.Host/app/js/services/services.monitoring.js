;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri, $q) {

        function createEndpointsSource(historyPeriod) {
            return Rx.Observable.interval(5000)
                .flatMap(function (i) {
                    return Rx.Observable.fromArray(loadEndpointDataFromMonitoringService(historyPeriod))
                        .flatMap(function (p) {
                            var o = Rx.Observable.fromPromise(p);
                            o = o.catch(Rx.Observable.empty());
                            return o;
                        });
                }).selectMany(function (endpoints) {
                    return endpoints;
                });
        }

        function loadEndpointDataFromMonitoringService(historyPeriod) {
            var promises = [];
            scConfig.monitoring_urls.forEach(function (url) {
                promises.push($http.get(uri.join(url, 'monitored-endpoints') + '?history=' + historyPeriod)
                    .then(function (result) {
                        var sourceIndex = scConfig.monitoring_urls.indexOf(url);

                        result.data.forEach(function (endpoint) {
                            endpoint.sourceIndex = sourceIndex;
                        });

                        return result.data;
                    }));
            });
            return promises;
        }

        function loadEndpointDetailsFromMonitoringService(observer, endpointName, sourceIndex, historyPeriod) {
            return $http.get(uri.join(scConfig.monitoring_urls[sourceIndex], 'monitored-endpoints', endpointName) + "?history=" + historyPeriod)
                .then(function (result) {
                    return result.data;
                }, function (error) {
                    return { error: error };
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