;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri, $q) {

        var historyPeriod = 5;
        var refreshEndpointSource;
        var refreshEndpointDetailsSource;

        var endpointsSource = Rx.Observable.create(function (observer) {
            var interval;
            var setUp = function () {
                updateData(observer);
                interval = setInterval(function () { updateData(observer); }, 5000);
            }
            refreshEndpointSource = function() {
                clearInterval(interval);
                setUp();
            }

            setUp();

            return function () {
                clearInterval(interval);
                refreshEndpointSource = null;
            };
        });

        var endpoints = endpointsSource
            .shareReplay(1)
            .selectMany(function (endpoints) {
                return endpoints;
            });

        function updateData(observer) {
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

        function loadEndpointDetails(observer, endpointName, sourceIndex) {
            $http.get(uri.join(scConfig.monitoring_urls[sourceIndex], 'monitored-endpoints', endpointName) + "?history=" + historyPeriod)
                .then(function (result) {
                    observer.onNext(result.data);
                }, function (error) {
                    observer.onNext({ error: error });
                });
        }

        function endpointDetails(endpointName, sourceIndex) {
            var endpointDetailsSource = Rx.Observable.create(function (observer) {
                var updateInterval;
                var setUp = function() {
                    loadEndpointDetails(observer, endpointName, sourceIndex);

                    updateInterval = setInterval(function() {loadEndpointDetails(observer, endpointName, sourceIndex); }, 5000);
                }

                refreshEndpointDetailsSource = function() {
                    clearInterval(updateInterval);
                    setUp();
                }

                setUp();

                return function () {
                    clearInterval(updateInterval);
                    refreshEndpointDetailsSource = null;
                };
            });

            return endpointDetailsSource
                .shareReplay(1);
        }

        function changeHistoryPeriod(period) {
            historyPeriod = period;

            if (refreshEndpointSource) {
                refreshEndpointSource();
            }

            if (refreshEndpointDetailsSource) {
                refreshEndpointDetailsSource();
            }
        }

        function getHistoryPeriod() {
            return historyPeriod;
        }

        var service = {
            endpoints: endpoints,
            endpointDetails: endpointDetails,
            changeHistoryPeriod: changeHistoryPeriod,
            getHistoryPeriod: getHistoryPeriod
        };

        return service;
    }

    Service.$inject = ['$http', 'rx', 'scConfig', 'uri', '$q'];

    angular.module('services.monitoringService', ['sc'])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));