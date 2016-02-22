;
(function(window, angular, undefined) {
    "use strict";

    function factory(
        $localStorage,
        serviceControlService,
        notifyService) {

        var notifier = notifyService();
        var stats = {
            active_endpoints: 0,
            failing_endpoints: 0,
            number_of_failed_messages: 0,
            number_of_failed_checks: 0
        };
        

        serviceControlService.getHeartbeatStats().then(function (stat) {
            notifier.notify('HeartbeatsUpdated', {
                failing: stat.failing,
                active: stat.active
            });

            stats.failing_endpoints = stat.failing;
            stats.active_endpoints = stat.active;
        });

        serviceControlService.getTotalFailedMessages().then(function (response) {
            notifier.notify('MessageFailuresUpdated', response);
            stats.number_of_failed_messages = response;
        });

        serviceControlService.getTotalFailingCustomChecks().then(function (response) {
            notifier.notify('CustomChecksUpdated', response);
            stats.number_of_failed_checks = response;
        });

        var storage = $localStorage.$default({});

        function set(data) {
            storage.data = data;
        }

        function get() {
            return storage.data;
        }

        function getstats() {
            return stats;
        }

        return {
            set: set,
            get: get,
            getstats: getstats,
            submittedForRetry: storage.submittedForRetry
        };

    }

    factory.$inject = [
        "$localStorage",
        "serviceControlService",
        "notifyService"
    ];

    angular.module("sc")
        .service("sharedDataService", factory);

}(window, window.angular));