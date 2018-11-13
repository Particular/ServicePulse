;
(function(window, angular, undefined) {
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
        scConfig,
        uriService,
        reindexingChecker
    ) {
        $scope.isMonitoringEnabled = scConfig.monitoring_urls && scConfig.monitoring_urls.reduce(function (currentlyEnabled, url) {
            return currentlyEnabled || url;
        }, false);

        $scope.isRecoverabilityEnabled = scConfig.service_control_url;

        $scope.SCVersion = '';
        $scope.is_compatible_with_sc = true;
        $scope.Version = version;
        $scope.isSCConnecting = true;

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
        }

        function customChecksUpdated(event, data) {
            $timeout(function() { //http://davidburgosonline.com/dev/2014/correctly-fix-angularjs-error-digest-already-in-progress/
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

        function logit(event, data) {
            $log.debug(data);
        }

        var notifier = notifyService();

        notifier.subscribe($scope, customChecksUpdated, 'CustomChecksUpdated');
        notifier.subscribe($scope, messageFailuresUpdated, 'MessageFailuresUpdated');
        notifier.subscribe($scope, heartbeatsUpdated, 'HeartbeatsUpdated');
        notifier.subscribe($scope, logit, 'ArchiveGroupRequestAccepted');

        notifier.subscribe($scope, function(event, data) {
            $scope.SCVersion = data.sc_version;
            $scope.is_compatible_with_sc = data.is_compatible_with_sc;
            if (!data.is_compatible_with_sc) {
                var scNeedsUpgradeMessage = 'You are using Service Control version ' + data.sc_version + '. Please, upgrade to version ' + data.minimum_supported_sc_version + ' or higher to unlock new functionality in ServicePulse.';
                toastService.showError(scNeedsUpgradeMessage);
                $location.path('/about');
            }
        }, 'EnvironmentUpdated');

        notifier.subscribe($scope, function (event, data) {
            toastService.showError('Your license has expired. Please contact Particular Software support at: <a href="http://particular.net/support">http://particular.net/support</a>');
        }, 'ExpiredLicense');

        notifier.subscribe($scope, function(event, data) {
            logit(event, data);
            toastService.showError('Group' + data.title + ' Archive Request Rejected');
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
                case 'SignalR started':
                    $scope.isSCConnected = true;
                    $scope.isSCConnecting = false;
                    break;
                case 'Reconnected':
                    $scope.isSCConnected = true;
                    $scope.isSCConnecting = false;
                    break;
                default:
                    toastService.showWarning(data);
                    break;
            }
       
        }, 'SignalREvent');

        notifier.subscribe($scope, function(event, data) {
            logit(event, data);
            if ($scope.isSCConnected) {
                toastService.showError(data);
            }
            $scope.isSCConnected = false;
            $scope.isSCConnecting = false;
        }, 'SignalRError');

        notifier.subscribe($scope, function(event, data) {
            var message = 'There was a problem retrieving your data';
            logit(event, message);
            toastService.showError(message);
        }, 'HttpError');

        notifier.subscribe($scope, function (event, data) {
            toastService.showInfo(data);

            if (data === 'ServiceControl is busy recreating indexes after a database upgrade...') {
                $rootScope.busyReindexingDatabase = true;
            } else if (data === 'Reindexing after database upgrade has completed.') {
                $rootScope.busyReindexingDatabase = false;
            }
        }, 'reindexing');

        // signalR Listener
        var listener = signalRListener(uriService.join(scConfig.service_control_url, 'messagestream'));

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
    };

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
        'scConfig',
        'uri',
        'reindexingChecker'
    ];

    angular.module('sc').controller('AppCtrl', controller);
}(window, window.angular));