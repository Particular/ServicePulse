;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri, $q) {

        var mappedUrls = scConfig.monitoring_urls.map(function (url) {
            return uri.join(url, '/data');
        });

        var source = Rx.Observable.create(function (observer) {

            console.log('start polling');
            updateData(observer);
            var interval = setInterval(function() { updateData(observer); },
                5000);

            return function () {
                console.log('stop polling');
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
                $http.get(url).then(function (result) {
                    observer.onNext(result.data["NServiceBus.Endpoints"]);
                });
            });
        }

        var service = {
            endpoints: endpoints
        };

        return service;
    }

    Service.$inject = ['$http', 'rx', 'scConfig', 'uri', '$q'];

    angular.module('services.monitoringService', ['sc'])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));