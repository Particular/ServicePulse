;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri, $q) {

        var endpointsSource = Rx.Observable.create(function (observer) {
            updateData(observer);

            var interval = setInterval(function() { updateData(observer); }, 5000);

            return function () {
                clearInterval(interval);
            };
        });

        var endpoints = endpointsSource
            .shareReplay(1)
            .selectMany(function (endpoints) {
                return endpoints;
            });

        function updateData(observer) {
            scConfig.monitoring_urls.forEach(function (url) {
                $http.get(uri.join(url, 'monitored-endpoints'))
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
            $http.get(uri.join(scConfig.monitoring_urls[sourceIndex], 'monitored-endpoints', endpointName))
                .then(function (result) {
                    observer.onNext(result.data);
                }, function (error) {
                    observer.onNext({ error: error });
                });
        }

        function endpointDetails(endpointName, sourceIndex) {
            var endpointDetailsSource = Rx.Observable.create(function (observer) {
                loadEndpointDetails(observer, endpointName, sourceIndex);

                var updateInterval = setInterval(function () { loadEndpointDetails(observer, endpointName, sourceIndex); }, 5000);

                return function () {
                    clearInterval(updateInterval);
                };
            });

            return endpointDetailsSource
                .shareReplay(1);
        }

        var service = {
            endpoints: endpoints,
            endpointDetails: endpointDetails
        };

        return service;
    }

    Service.$inject = ['$http', 'rx', 'scConfig', 'uri', '$q'];

    angular.module('services.monitoringService', ['sc'])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));