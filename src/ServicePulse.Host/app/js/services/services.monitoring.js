;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri, $q) {

        function createEndpointsSource(historyPeriod) {
            return Rx.Observable.create(function (observer) {
                var interval;
                var setUp = function () {
                    clearInterval(interval);

                    loadEndpointDataFromMonitoringService(observer, historyPeriod);
                    interval = setInterval(function () { loadEndpointDataFromMonitoringService(observer, historyPeriod); }, 5000);
                }

                setUp();

                return function () {
                    clearInterval(interval);
                    interval = null;
                };
            }).shareReplay(1)
            .selectMany(function (endpoints) {
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
            var endpointDetailsSource = Rx.Observable.create(function (observer) {
                var interval;
                var setUp = function() {
                    clearInterval(interval);

                    loadEndpointDetailsFromMonitoringService(observer, endpointName, sourceIndex, historyPeriod);

                    interval = setInterval(function () { loadEndpointDetailsFromMonitoringService(observer, endpointName, sourceIndex, historyPeriod); }, 5000);
                }

                setUp();

                return function () {
                    clearInterval(interval);
                    interval = null;
                };
            });

            return endpointDetailsSource
                .shareReplay(1);
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