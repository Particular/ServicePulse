﻿;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri) {
        var endpoints;
        function getData() {
            var outcome =  getEndpoints().then(function(response) {
                if (response.status !== 304) {
                    endpoints = response.data;
                }    
            
                var url = uri.join(scConfig.monitoring_url, '/data');
                return $http.get(url)
                    .then(function (response) {
                        response.data["NServiceBus.Endpoints"].forEach(function(item) {
                            var e = endpoints.filter(function (endpoint) { return endpoint.title === item.Name; });
                            if (e.length === 1) {
                                item.Errors = e[0].count;
                            }
                        });
                        endpoints.filter(function(endpoint) {
                            return response.data["NServiceBus.Endpoints"].filter(function(search) {
                                    return search.Name === endpoint.title;
                                }).length ===
                                0;
                        }).forEach(function(missingEndpoint) {
                            response.data["NServiceBus.Endpoints"].push({
                                "Name": missingEndpoint.title,
                                "Errors": missingEndpoint.count,
                                "Data": {
                                    "Timestamps": [],
                                    "CriticalTime": [],
                                    "ProcessingTime": []
                                }
                            });
                            });
                        return response;
                    })
                    .catch(function(fallback) {
                        notifications.pushSticky('Can not connect to Monitoring Service');
                    });
            });
            return outcome;
        }

        function getEndpoints() {
            return rx.Observable.merge(scConfig.monitoring_urls.map(function (url) {
                var requestUri = uri.join(url, '/raw');
                var retryCount = 0;

                var httpRequest = rx.Observable.just(url)
                    .flatMap(function (requestUrl) {
                        return $http.get(requestUrl);
                    }).retryWhen(function (errors) {
                        return errors.scan(function (count, error) {
                            if (++count >= 10) {
                                throw error;
                            }

                            return count;
                        }, 0).delay(5000);
                    });

                var repeatRequests = rx.Observable.interval(5000).flatMapLatest(httpRequest);

                var streamedResults = rx.Observable.concat(
                    httpRequest.take(1),
                    repeatRequests);

                // Flatten the endpoints array into individual endpoints
                return streamedResults.selectMany(function (endpoints) {
                    return endpoints;
                });
        var previousExceptionGroupEtag;

        function getEndpoints() {
            var url = uri.join(scConfig.service_control_url, 'recoverability', 'endpoints');
            return $http.get(url).then(function (response) {
                var status = 200;
                if (previousExceptionGroupEtag === response.headers('etag')) {
                    status = 304;
                } else {
                    previousExceptionGroupEtag = response.headers('etag');
                }
                return {
                    data: response.data,
                    status: status
                };
            });
            }));
        }

        var service = {
            getEndpoints: getEndpoints
            getData: getData
        };

        return service;
    }
    
    Service.$inject = ['$http', 'rx', 'scConfig', 'uri'];

    angular.module('services.monitoringService', ['sc'])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));