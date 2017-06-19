;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, scConfig, notifications, uri) {
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
        }

        var service = {
            getData: getData
        };

        return service;
    }

    Service.$inject = ['$http', 'scConfig', 'notifications', 'uri'];

    angular.module('services.monitoringService', ['sc'])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));