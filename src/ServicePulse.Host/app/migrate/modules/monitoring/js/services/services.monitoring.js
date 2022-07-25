(function (window, angular, $, Rx) {
    'use strict';

    function Service($http, rx, connectionsManager, uri, $q) {

        var mu = connectionsManager.getMonitoringUrl();

        function createEndpointsSource(historyPeriod, refreshInterval) {
            return Rx.Observable.interval(refreshInterval).startWith(0)
                .flatMap(function (i) {
                    return Rx.Observable.fromPromise(loadEndpointDataFromMonitoringService(historyPeriod));
                }).selectMany(function (endpoints) {
                    return endpoints;
                });
        }

        function loadEndpointDataFromMonitoringService(historyPeriod) {
            return $http.get(uri.join(mu, 'monitored-endpoints') + '?history=' + historyPeriod)
                .then(function (result) {
                    return result.data.length !== 0
                        ? result.data
                        : [{ empty: true }];
                },
                    (error) => {
                        return [{ error: error }];
                    }
                );
        }

        function loadEndpointDetailsFromMonitoringService(endpointName, historyPeriod) {
            return $http.get(uri.join(mu, 'monitored-endpoints', endpointName) + "?history=" + historyPeriod)
                .then(function (result) {
                    filterOutSystemMessage(result.data);
                    return result.data;
                }, function (error) {
                    return { error: error };
                });
        }

        function filterOutSystemMessage(data) {
            data.messageTypes = data.messageTypes.filter(mt => {
                return mt.id;
            });
        }

        function createEndpointDetailsSource(endpointName, historyPeriod, refreshInterval) {
            return Rx.Observable.interval(refreshInterval).startWith(0)
                .flatMap(function (i) {
                    return Rx.Observable.fromPromise(loadEndpointDetailsFromMonitoringService(endpointName, historyPeriod));
                });
        }

        function getMonitoredEndpoints() {
            return $http.get(uri.join(mu, 'monitored-endpoints') + '?history=1');
        }

        function removeEndpointInstance(endpointName, instanceId) {
            return $http.delete(uri.join(mu, 'monitored-instance', endpointName, instanceId));
        }

        function getServiceControlMonitoringVersion() {
            return $http.get(mu).then(function(response) {
                return response.headers('X-Particular-Version');
            });
        }

        function isRemovingEndpointEnabled() {
            return $http({
                method: 'OPTIONS',
                url: mu
            }).then((response) => {
                const headers = response.headers();

                const allow = headers.allow;
                const deleteAllowed = allow.indexOf('DELETE') >= 0;

                return deleteAllowed;
            }, function() {
                return false;
            });
        }

       function getDisconnectedCount() {
            return $http.get(uri.join(mu, 'monitored-endpoints', 'disconnected'));
        }

        var service = {
            createEndpointsSource,
            createEndpointDetailsSource,
            getMonitoredEndpoints,
            getServiceControlMonitoringVersion,
            removeEndpointInstance,
            isRemovingEndpointEnabled,
            getDisconnectedCount
        };

        return service;
    }

    Service.$inject = ['$http', 'rx', 'connectionsManager', 'uri', '$q', 'toastService'];

    angular.module('services.monitoringService', ['sc'])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery, window.Rx));
