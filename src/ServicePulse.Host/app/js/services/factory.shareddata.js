;
(function (window, angular, undefined) {
    "use strict";

    function factory(
        $localStorage,
        serviceControlService,
        semverService,
        notifyService,
        version) {


        var spVersion = version;
        var notifier = notifyService();
        var stats = {
            active_endpoints: 0,
            failing_endpoints: 0,
            number_of_exception_groups: 0,
            number_of_failed_messages: 0,
            number_of_failed_checks: 0,
            number_of_archived_messages: 0
        };

        var configuration = {
            data_retention: {
                audit_retention_period: '00:00:00',
                error_retention_period: "00:00:00"
            }
        };

        var environment = {
            sc_version: undefined,
            minimum_supported_sc_version: "1.12.0",
            is_compatible_with_sc: true,
            sp_version: spVersion
        };

        serviceControlService.getVersion()
        .then(function (scVersion) {
            environment.sc_version = scVersion;
            if (!semverService.isSupported(scVersion, environment.minimum_supported_sc_version)) {
                environment.is_compatible_with_sc = false;
            }
            notifier.notify('EnvironmentUpdated', environment);
        });

        serviceControlService.checkLicense().then(function (isValid) {
            if (!isValid) {
                notifier.notify('ExpiredLicense', environment);
            }
        });

        serviceControlService.getConfiguration().then(function (response) {
            notifier.notify('ConfigurationUpdated', response);
            configuration = response || configuration;
        });

        serviceControlService.getHeartbeatStats().then(function (stat) {
            notifier.notify('HeartbeatsUpdated', {
                failing: stat.failing || 0,
                active: stat.active || 0
            });

            stats.failing_endpoints = stat.failing || 0;
            stats.active_endpoints = stat.active || 0;
        });

        serviceControlService.getTotalFailedMessages().then(function (response) {
            notifier.notify('MessageFailuresUpdated', response);
            stats.number_of_failed_messages = response || 0;
        });

        serviceControlService.getTotalFailingCustomChecks().then(function (response) {
            notifier.notify('CustomChecksUpdated', response || 0);
            stats.number_of_failed_checks = response || 0;
        });

        serviceControlService.getTotalArchivedMessages().then(function (response) {
            notifier.notify('ArchivedMessagesUpdated', response || 0);
            stats.number_of_archived_messages = response || 0;
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

        function getconfiguration() {
            return configuration;
        }

        function getenvironment() {
            return environment;
        }

        return {
            set: set,
            get: get,
            getstats: getstats,
            getConfiguration: getconfiguration,
            getenvironment: getenvironment,
            submittedForRetry: storage.submittedForRetry
        };

    }

    factory.$inject = [
        "$localStorage",
        "serviceControlService",
        "semverService",
        "notifyService",
        "version"
    ];

    angular.module("sc")
        .service("sharedDataService", factory);

}(window, window.angular));