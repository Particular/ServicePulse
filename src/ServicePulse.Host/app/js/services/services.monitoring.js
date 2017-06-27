;
(function (window, angular, $, undefined) {
    'use strict';

    function Service($http, rx, scConfig, uri, $q) {

        var mappedUrls = scConfig.monitoring_urls.map(function (url) {
            return uri.join(url, '/data');
        });

        var subject = new rx.Subject();

        function updateData() {
            mappedUrls.forEach(function (url) {
                $http.get(url).then(function (result) {
                    subject.onNext(result.data["NServiceBus.Endpoints"]);
                });
            });
        }

        updateData();
        setInterval(updateData,
            5000);

        var replaySubject = subject
            .replay(function(x) { return x; }, 1)
            .selectMany(function(endpoints) { return endpoints; });

        var service = {
            endpoints: replaySubject
        };

        return service;
    }

    Service.$inject = ['$http', 'rx', 'scConfig', 'uri', '$q'];

    angular.module('services.monitoringService', ['sc'])
        .service('monitoringService', Service);
}(window, window.angular, window.jQuery));