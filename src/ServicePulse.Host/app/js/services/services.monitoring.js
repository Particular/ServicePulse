;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri, toastr) {

        var connectionToasts = [];
        var mappedUrls;
        var source = Rx.Observable.create(function (observer) {
            mappedUrls = scConfig.monitoring_urls.map(function (url) {
                return uri.join(url, '/data');
            });

            updateData(observer);
            var interval = setInterval(function() { updateData(observer); },
                5000);

            return function () {
                clearInterval(interval);
            };
        });

        var endpoints = source
            .shareReplay(1)
            .selectMany(function (endpoints) {
                return endpoints;
            });

        function updateData(observer) {
            mappedUrls.forEach(function (url) {
                $http.get(url)
                    .then(function (result) {
                        if (connectionToasts[url] !== undefined) {
                            var message = connectionToasts[url];
                            // doesn't exist
                            toastr.clear(message);
                            connectionToasts[url] = undefined;
                        }
                        observer.onNext(result.data);
                    }, function (error) {
                        if (connectionToasts[url] === undefined) {
                            var message = "unable to connect to ServiceControl.Monitoring at: " + url;
                            var x = toastr.warning(message,
                                '',
                                {
                                    closeButton: true,
                                    timeOut: 0
                                });
                            connectionToasts[url] = x;
                        }
                    });
            });
        }

        var service = {
            endpoints: endpoints
        };

        return service;
    }

    Service.$inject = ['$http', 'rx', 'scConfig', 'uri', 'toastr'];

    angular.module('services.monitoringService', ['sc'])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));