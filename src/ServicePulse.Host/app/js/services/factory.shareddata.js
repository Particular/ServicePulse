(function (window, angular) {
    "use strict";

    function factory(
        $rootScope,
        $interval,
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
            number_of_archived_messages: 0,
            number_of_pending_retries: 0,
            number_of_endpoints: 0
        };

        var configuration = {
            data_retention: {
                audit_retention_period: '00:00:00',
                error_retention_period: "00:00:00"
            }
        };

        var environment = {
            sc_version: undefined,
            minimum_supported_sc_version: "1.39.0",
            is_compatible_with_sc: true,
            sp_version: spVersion
        };

        serviceControlService.getServiceControlMetadata()
        .then(function (metaData) {
            environment.sc_version = metaData.version;
            environment.supportsArchiveGroups = metaData.archivedGroupsUrl && metaData.archivedGroupsUrl.length > 0;

            if (!semverService.isSupported(metaData.version, environment.minimum_supported_sc_version)) {
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

        serviceControlService.getTotalArchivedMessages().then(function (response) {
            notifier.notify('ArchivedMessagesUpdated', response || 0);
        });

        serviceControlService.getTotalFailedMessages().then(function (response) {
            notifier.notify('MessageFailuresUpdated', response);
        });

        serviceControlService.getTotalFailingCustomChecks().then(function (response) {
            notifier.notify('CustomChecksUpdated', response || 0);
        });

        serviceControlService.getTotalPendingRetries().then(function (response) {
            notifier.notify('PendingRetriesTotalUpdated', response || 0);
        });

        notifier.subscribe($rootScope, function (event, data) {
            stats.number_of_exception_groups = data || 0;
        }, "ExceptionGroupCountUpdated");

        notifier.subscribe($rootScope, function (event, data) {
            stats.number_of_archived_messages = data || 0;
        }, "ArchivedMessagesUpdated");

        notifier.subscribe($rootScope, function (event, data) {
            stats.number_of_failed_messages = data || 0;
        }, "MessageFailuresUpdated");

        notifier.subscribe($rootScope, function (event, data) {
            stats.number_of_failed_checks = data || 0;
        }, "CustomChecksUpdated");

        notifier.subscribe($rootScope, function (event, data) {
            stats.number_of_endpoints = data || 0;
        }, 'EndpointCountUpdated');

        notifier.subscribe($rootScope, function (event, data) {
            stats.number_of_pending_retries = data || 0;
        }, "PendingRetriesTotalUpdated");

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
        "$rootScope",
        "$interval",
        "$localStorage",
        "serviceControlService",
        "semverService",
        "notifyService",
        "version"
    ];

    angular.module("sc")
        .service("sharedDataService", factory);

}(window, window.angular));
