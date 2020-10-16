(function(window, angular, $) {
    'use strict';

    function controller(
        $scope,
        $log,
        $timeout,
        $location,
        $window,
        $rootScope,
        serviceControlService,
        version,
        toastService,
        signalRListener,
        notifyService,
        semverService,
        connectionsManager,
        uriService,
        reindexingChecker,
        licenseNotifierService,
        licenseService,
        license,
        $route,
        configurationService,
        monitoringService,
        disconnectedEndpointMonitor
    ) {
        var notifier = notifyService();

        var scu = connectionsManager.getServiceControlUrl();

        $scope.isMonitoringEnabled = connectionsManager.getIsMonitoringEnabled();

        $scope.loadingInitialData = true;
        $scope.scConnectedAtLeastOnce = false;
        $scope.isRecoverabilityEnabled = scu !== null && scu !== undefined;
        $scope.serviceControlUrl = scu;

        $scope.SCMonitoringVersion = '';
        $scope.SCVersion = '';
        $scope.is_compatible_with_sc = true;
        $scope.Version = version;
        $scope.isSCConnecting = true;

        $scope.isDeleteEndpointsEnabled = false;

        $scope.$on('$locationChangeStart', function (event, next, current) {
            var route = $route.routes[$location.path()];
            if (route && !$scope.isSCConnected && !$scope.scConnectedAtLeastOnce) {
                var routeData = route.data;

                if (routeData && routeData.redirectWhenNotConnected) {
                    $log.debug('not connected, and never connected once. Current route is a configuration route that requires redirect to: ', routeData.redirectWhenNotConnected);
                    event.preventDefault();
                    $location.path(routeData.redirectWhenNotConnected);
                }
            }
        });

        setTimeout(function () {
            // This delay needs to be here for the toastr service to be ready.
            licenseNotifierService.warnOfLicenseProblem(license.license_status);
        }, 3000);

        configurationService.isEndpointDeleteSupported().then(function(deleteEnabled) {
            $scope.isDeleteEndpointsEnabled = deleteEnabled;
        });

        $scope.isPlatformExpired = licenseNotifierService.isPlatformExpired(license.license_status);
        $scope.isPlatformTrialExpired = licenseNotifierService.isPlatformTrialExpired(license.license_status);
        $scope.isInvalidDueToUpgradeProtectionExpired = licenseNotifierService.isInvalidDueToUpgradeProtectionExpired(license.license_status);

        if ($scope.isPlatformExpired || $scope.isPlatformTrialExpired || $scope.isInvalidDueToUpgradeProtectionExpired) {
            $scope.licensewarning = "danger";
        }

        if (licenseNotifierService.isValidWithWarning(license.license_status)) {
            $scope.licensewarning = "warning";
        }

        $scope.isActive = function(viewLocation) {
            var active = $location.path().startsWith(viewLocation);
            return active;
        };

        $($window.document).on('click', function (e) {
            if ($('.navbar-collapse.in').is(':visible')) {
                $('.navbar-collapse.in').collapse('hide');
            }
        });

        $scope.$on('$routeChangeError', function(event, current, previous, rejection) {
            toastService.showError('Route change error');
        });

        $scope.showAlertBadgeOnCollapsedMenu = function () {
            return ($scope.failedcustomchecks || 0) + ($scope.failedmessages || 0) + ($scope.failedheartbeats || 0) > 0;
        };

        function customChecksUpdated(event, data) {
            $timeout(function() { //https://davidburgos.blog/correctly-fix-angularjs-error-digest-already-in-progress/
                data = (data === 0 || data === '0') ? undefined : data;
                $scope.failedcustomchecks = data;
                logit(data);
            });
        }

        function messageFailuresUpdated(event, data) {
            $timeout(function() {
                data = (data === 0 || data === '0') ? undefined : data;
                $scope.failedmessages = data;
                logit(data);
            });
        }

        function heartbeatsUpdated(event, data) {
            $timeout(function() {
                data = (data === 0 || data === '0') ? undefined : data;
                $scope.failedheartbeats = data.failing;
                logit(data);
            });
        }

        function disconnectedEndpointsUpdated(event, data) {
            $timeout(function () {
                data = (data === 0 || data === '0') ? undefined : data;
                $scope.disconnectedendpoints = data;
                logit(data);
            });
        }

        function logit(event, data) {
            $log.debug(data);
        }

        notifier.subscribe($scope, function(event, data) {
            if (connectionsManager.getIsMonitoringEnabled()) {
                if ((data.status.isSCConnected || data.status.isSCConnecting) && (data.status.isMonitoringConnected || data.status.isMonitoringConnecting || data.status.isMonitoringConnecting === undefined)) {
                    $scope.connectionswarning = undefined;
                } else if (!data.status.isSCConnected || !data.status.isMonitoringConnected) {
                    $scope.connectionswarning = 'danger';
                }
            } else {
                if (data.status.isSCConnected || data.status.isSCConnecting) {
                    $scope.connectionswarning = undefined;
                } else if (!data.status.isSCConnected) {
                    $scope.connectionswarning = 'danger';
                }
            }
        }, 'ConnectionsStatusChanged');

        notifier.subscribe($scope, customChecksUpdated, 'CustomChecksUpdated');
        notifier.subscribe($scope, messageFailuresUpdated, 'MessageFailuresUpdated');
        notifier.subscribe($scope, heartbeatsUpdated, 'HeartbeatsUpdated');

        notifier.subscribe($scope, disconnectedEndpointsUpdated, disconnectedEndpointMonitor.updatedEvent);
        disconnectedEndpointMonitor.startService();

        notifier.subscribe($scope, logit, 'ArchiveGroupRequestAccepted');

        notifier.subscribe($scope, function(event, data) {
            $scope.SCVersion = data.sc_version;
            $scope.is_compatible_with_sc = data.is_compatible_with_sc;
            $rootScope.supportsArchiveGroups = data.supportsArchiveGroups;

            if (!data.is_compatible_with_sc) {
                var scNeedsUpgradeMessage = 'You are using Service Control version ' + data.sc_version + '. Please, upgrade to version ' + data.minimum_supported_sc_version + ' or higher to unlock new functionality in ServicePulse.';
                toastService.showError(scNeedsUpgradeMessage);
                $location.path('/about');
            }
        }, 'EnvironmentUpdated');

        notifier.subscribe($rootScope, function (event, data) {
            if (!$scope.SCMonitoringVersion && data.isMonitoringConnected) {
                monitoringService.getServiceControlMonitoringVersion().then(function(data) {
                    $scope.SCMonitoringVersion = data;
                });
            }
        }, 'MonitoringConnectionStatusChanged');

        notifier.subscribe($scope, function (event, data) {
            toastService.showError('Your license has expired. Please contact Particular Software support at: <a href="http://particular.net/support">http://particular.net/support</a>');
        }, 'ExpiredLicense');

        notifier.subscribe($scope, function(event, data) {
            logit(event, data);
            toastService.showError('Group' + data.title + ' Delete request rejected');
        }, 'ArchiveGroupRequestRejected');

        notifier.subscribe($scope, logit, 'RetryGroupRequestAccepted');

        notifier.subscribe($scope, function(event, data) {
            logit(event, data);
            toastService.showError('Group' + data.title + ' Retry Request Rejected');
        }, 'RetryGroupRequestRejected');

        notifier.subscribe($scope, logit, 'MessageFailedRepeatedly');
        notifier.subscribe($scope, logit, 'MessageFailed');
        notifier.subscribe($scope, logit, 'MessagesSubmittedForRetry');

        notifier.subscribe($scope, function(event, data) {
            logit(event, data);

            switch(data) {
                case 'SignalR starting':
                    $scope.isSCConnected = false;
                    $scope.isSCConnecting = true;
                    break;
                case 'SignalR started':
                    $scope.isSCConnected = true;
                    $scope.isSCConnecting = false;
                    $scope.scConnectedAtLeastOnce = true;
                    break;
                case 'Reconnected':
                    $scope.isSCConnected = true;
                    $scope.isSCConnecting = false;
                    $scope.scConnectedAtLeastOnce = true;

                    if ($scope.signalRConnectionErrorToast) {
                        toastService.clear($scope.signalRConnectionErrorToast);
                        $scope.signalRConnectionErrorToast = undefined;
                    }
                    break;
                default:
                    toastService.showWarning(data);
                    break;
            }

            notifier.notify('ServiceControlConnectionStatusChanged', {
                isSCConnected : $scope.isSCConnected,
                isSCConnecting: $scope.isSCConnecting,
                scConnectedAtLeastOnce: $scope.scConnectedAtLeastOnce
            });

        }, 'SignalREvent');

        notifier.subscribe($scope, function(event, data) {
            logit(event, data);

            $scope.isSCConnected = false;
            $scope.isSCConnecting = false;

            notifier.notify('ServiceControlConnectionStatusChanged', {
                isSCConnected : $scope.isSCConnected,
                isSCConnecting : $scope.isSCConnecting,
                scConnectedAtLeastOnce : $scope.scConnectedAtLeastOnce
            });
        }, 'SignalRError');

        notifier.subscribe($scope, function(event, data) {
            var message = 'There was a problem retrieving your data';
            logit(event, message);
            toastService.showError(message);
        }, 'HttpError');

        $scope.$on('$viewContentLoaded', function (event) {
            if ($scope.loadingInitialData) {
                if (serviceControlService.performingDataLoadInitially) {
                    var unsubscribe = notifier.subscribe($scope, function () {
                        $scope.loadingInitialData = false;
                        unsubscribe();
                    }, 'InitialLoadComplete');
                } else {
                    $scope.loadingInitialData = false;
                }
            }
        });

        notifier.subscribe($scope, function (event, data) {
            toastService.showInfo(data);

            if (data === 'ServiceControl is busy recreating indexes after a database upgrade...') {
                $rootScope.busyReindexingDatabase = true;
            } else if (data === 'Reindexing after database upgrade has completed.') {
                $rootScope.busyReindexingDatabase = false;
            }
        }, 'reindexing');

        // signalR Listener
        var listener = signalRListener(uriService.join(scu, 'messagestream'));

        listener.subscribe($scope, function(message) {
            notifier.notify('SignalREvent', message);
        }, 'SignalREvent');

        listener.subscribe($scope, function(message) {
            notifier.notify('SignalRError', message);
        }, 'SignalRError');

        listener.subscribe($scope, function(message) {
            notifier.notify('CustomChecksUpdated', message.failed);
        }, 'CustomChecksUpdated');

        listener.subscribe($scope, function (message) {
            notifier.notify('MessageRedirectCreated', message);
        }, 'MessageRedirectCreated');

        listener.subscribe($scope, function (message) {
            notifier.notify('MessageRedirectChanged', message);
        }, 'MessageRedirectChanged');

        listener.subscribe($scope, function (message) {
            notifier.notify('MessageRedirectRemoved', message);
        }, 'MessageRedirectRemoved');

        listener.subscribe($scope, function(message) {
            notifier.notify('MessageFailed', message);
        }, 'MessageFailed');

        listener.subscribe($scope, function (message) {
            notifier.notify('MessageFailureResolvedManually', message);
        }, 'MessageFailureResolvedManually');

        listener.subscribe($scope, function (message) {
            notifier.notify('MessagesSubmittedForRetry', message);
        }, 'MessagesSubmittedForRetry');

        listener.subscribe($scope, function (message) {
            notifier.notify('MessageFailureResolvedByRetry', message);
        }, 'MessageFailureResolvedByRetry');

        listener.subscribe($scope, function (message) {
            logit(message);

            notifier.notify('MessageFailuresUpdated', message.unresolved_total || message.total);
            notifier.notify('ArchivedMessagesUpdated', message.archived_total || 0);


        }, 'MessageFailuresUpdated');

        listener.subscribe($scope, function(message) {
            notifier.notify('HeartbeatsUpdated', {
                failing: message.failing,
                active: message.active
            });
        }, 'HeartbeatsUpdated');

        listener.subscribe($scope, function(message) {
            notifier.notify('EventLogItemAdded', message);
        }, 'EventLogItemAdded');

        listener.subscribe($scope, function(message) {
            notifier.notify('MessagesSubmittedForRetry', message);
        }, 'MessagesSubmittedForRetry');

        listener.subscribe($scope, function (message) {
            notifier.notify('FailedMessageGroupArchived', message);
        }, 'FailedMessageGroupArchived');

        listener.subscribe($scope, function (message) {
            notifier.notify('ArchiveOperationStarting', message);
        }, 'ArchiveOperationStarting');

        listener.subscribe($scope, function (message) {
            notifier.notify('ArchiveOperationBatchCompleted', message);
        }, 'ArchiveOperationBatchCompleted');

        listener.subscribe($scope, function (message) {
            notifier.notify('ArchiveOperationCompleted', message);
        }, 'ArchiveOperationCompleted');

        listener.subscribe($scope, function (message) {
            notifier.notify('RetryOperationWaiting', message);
        }, 'RetryOperationWaiting');

        listener.subscribe($scope, function (message) {
            notifier.notify('RetryOperationPreparing', message);
        }, 'RetryOperationPreparing');

        listener.subscribe($scope, function (message) {
            notifier.notify('RetryOperationForwarding', message);
        }, 'RetryOperationForwarding');

        listener.subscribe($scope, function (message) {
            notifier.notify('RetryOperationForwarded', message);
        }, 'RetryOperationForwarded');

        listener.subscribe($scope, function (message) {
            notifier.notify('RetryOperationCompleted', message);
        }, 'RetryOperationCompleted');

        reindexingChecker.startTrackingStatus();
    }

    controller.$inject = [
        '$scope',
        '$log',
        '$timeout',
        '$location',
        '$window',
        '$rootScope',
        'serviceControlService',
        'version',
        'toastService',
        'signalRListener',
        'notifyService',
        'semverService',
        'connectionsManager',
        'uri',
        'reindexingChecker',
        'licenseNotifierService',
        'licenseService',
        'license',
        '$route',
        'configurationService',
        'monitoringService',
        'disconnectedEndpointMonitor'
    ];

    angular.module('sc').controller('AppCtrl', controller);
}(window, window.angular, window.jQuery));
