;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri, $q) {

        function createEndpointsSource(historyPeriod, refreshInterval) {
            return Rx.Observable.interval(refreshInterval).startWith(0)
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
            return scConfig.monitoring_urls.map(function (url) {
                return $http.get(uri.join(url, 'monitored-endpoints') + '?history=' + historyPeriod)
                    .then(function (result) {
                        var sourceIndex = scConfig.monitoring_urls.indexOf(url);

                        result.data.forEach(function (endpoint) {
                            endpoint.sourceIndex = sourceIndex;
                        });

                        return result.data;
                    },
                    (error) => {
                        var sourceIndex = scConfig.monitoring_urls.indexOf(url);
                        return [{ error: error, sourceIndex: sourceIndex }];
                        }
                    );
            });
        }

        function loadEndpointDetailsFromMonitoringService(endpointName, sourceIndex, historyPeriod) {
            return $http.get(uri.join(scConfig.monitoring_urls[sourceIndex], 'monitored-endpoints', endpointName) + "?history=" + historyPeriod)
                .then(function (result) {
                    filterOutSystemMessage(result.data);
                    return result.data;
                }, function (error) {
                    return { error: error };
                });
        }

        function filterOutSystemMessage(data)
        {
            data.messageTypes = data.messageTypes.filter(mt => {
                return mt.id;
            });
        }

        function createEndpointDetailsSource(endpointName, sourceIndex, historyPeriod, refreshInterval) {
            return Rx.Observable.interval(refreshInterval).startWith(0)
                .flatMap(function (i) {
                    return Rx.Observable.fromPromise(loadEndpointDetailsFromMonitoringService(endpointName, sourceIndex, historyPeriod));
                });
        }

        function getMonitoredEndpoints() {
            return scConfig.monitoring_urls.map(function (url) {
                return $http.get(uri.join(url, 'monitored-endpoints') + '?history=1');
            });
        }

        var service = {
            createEndpointsSource: createEndpointsSource,
            createEndpointDetailsSource: createEndpointDetailsSource,
            getMonitoredEndpoints: getMonitoredEndpoints,
        };

        return service;
    }

    Service.$inject = ['$http', 'rx', 'scConfig', 'uri', '$q', 'toastService'];

    angular.module('services.monitoringService', ['sc'])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));
