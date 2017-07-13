﻿;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri, $q) {

        var source = Rx.Observable.create(function (observer) {

            updateData(observer);

            var interval = setInterval(function() { updateData(observer); }, 5000);

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
            scConfig.monitoring_urls.forEach(function (url) {
                $http.get(uri.join(url, 'monitored-endpoints'))
                    .then(function (result) {
                        observer.onNext(result.data);
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