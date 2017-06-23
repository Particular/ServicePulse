;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri, $q) {
        var endpoints;
        function getEndpoints() {
            var mappedUrls = [{
                url: uri.join(scConfig.service_control_url, 'recoverability', 'endpoints'),
                mapper: function (endpoint) {
                    return {
                        Name: endpoint.title,
                        Count: endpoint.count
                    };
                }
            }].concat(scConfig.monitoring_urls.map(function (url) {
                    return {
                        url: uri.join(url, '/data')
                    };
            }));

            return rx.Observable.merge(mappedUrls.map(function (mappedUrl) {
                var httpRequest = rx.Observable.just(mappedUrl.url)
                    .flatMap(function (requestUrl) {
                        var request = $http.get(requestUrl);

                        if (mappedUrl.mapper) {
                            request = request.then(function (result) {
                            return result.map(mappedUrl.mapper);
                            });
                        }

                        return request;
                    }).retryWhen(automaticRetry);

                var repeatRequests = rx.Observable.interval(5000).flatMapLatest(httpRequest);

                var streamedResults = rx.Observable.concat(
                    httpRequest.take(1),
                    repeatRequests);

                // Flatten the endpoints array into individual endpoints
                return streamedResults.selectMany(function (endpoints) {
                    return endpoints;
                });
            }));
        }

        function automaticRetry(errors) {
            return errors.scan(function (count, error) {
                if (++count >= 10) {
                    throw error;
                }

                return count;
            }, 0).delay(5000);
        }

        var service = {
            getEndpoints: getEndpoints
        };

        return service;
    }
    
    Service.$inject = ['$http', 'rx', 'scConfig', 'uri', '$q'];

    angular.module('services.monitoringService', ['sc'])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));