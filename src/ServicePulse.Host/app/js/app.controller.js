;
(function(window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $log,
        $timeout,
        $location,
        $window,
        serviceControlService,
        version,
        toastService,
        signalRListener,
        notifyService,
        semverService,
        scConfig,
        sharedDataService
    ) {

        var scVersionSupportingExceptionGroups = "1.6.0";

        serviceControlService.getVersion()
            .then(function(scVersion) {
                $scope.SCVersion = scVersion;
                if (!semverService.isSupported(scVersion, scVersionSupportingExceptionGroups)) {
                    var scNeedsUpgradeMessage = "You are using Service Control version " + scVersion + ". Please, upgrade to version " + scVersionSupportingExceptionGroups + " or higher to unlock new functionality in ServicePulse.";
                    toastService.showError(scNeedsUpgradeMessage);
                }
            });

        serviceControlService.checkLicense().then(function(isValid) {
            if (!isValid) {
                toastService.showError('Your license has expired. Please contact Particular Software support at: <a href="http://particular.net/support">http://particular.net/support</a>');
            }
        });

        $scope.isActive = function(viewLocation) {
            var active = (viewLocation === $location.path());
            return active;
        };
        $scope.Version = version;

        $scope.$on("$routeChangeError", function(event, current, previous, rejection) {
            toastService.showError("Route change error");
        });

        function customChecksUpdated(event, data) {
            $timeout(function() { //http://davidburgosonline.com/dev/2014/correctly-fix-angularjs-error-digest-already-in-progress/
                data = (data === 0 || data === "0") ? undefined : data;
                $scope.failedcustomchecks = data;
                logit(data);
            });
        }

        function messageFailuresUpdated(event, data) {
            $timeout(function() {
                data = (data === 0 || data === "0") ? undefined : data;
                $scope.failedmessages = data;
                logit(data);
            });
        }

        function heartbeatsUpdated(event, data) {
            $timeout(function() {
                data = (data === 0 || data === "0") ? undefined : data;
                $scope.failedheartbeats = data.failing;
                logit(data);
            });
        }

        function logit(event, data) {
            $log.debug(data);
        }

        var notifier = notifyService();

        notifier.subscribe($scope, customChecksUpdated, "CustomChecksUpdated");
        notifier.subscribe($scope, messageFailuresUpdated, "MessageFailuresUpdated");
        notifier.subscribe($scope, heartbeatsUpdated, "HeartbeatsUpdated");
        notifier.subscribe($scope, logit, "ArchiveGroupRequestAccepted");

        notifier.subscribe($scope, function(event, data) {
            logit(event, data);
            toastService.showError("Group" + data.title + " Archive Request Rejected");
        }, "ArchiveGroupRequestRejected");

        notifier.subscribe($scope, logit, "RetryGroupRequestAccepted");

        notifier.subscribe($scope, function(event, data) {
            logit(event, data);
            toastService.showError("Group" + data.title + " Retry Request Rejected");
        }, "RetryGroupRequestRejected");

        notifier.subscribe($scope, logit, "MessageFailedRepeatedly");
        notifier.subscribe($scope, logit, "MessageFailed");
        notifier.subscribe($scope, logit, "MessagesSubmittedForRetry");

        notifier.subscribe($scope, function(event, data) {
            logit(event, data);

            switch(data) {
                case 'SignalR started':
                    toastService.showInfo('Connected to ServiceControl');
                    break;
                case 'Reconnected':
                    toastService.showInfo('Reconnected to ServiceControl');
                    break;
                default:
                    toastService.showWarning(data);
                    break;
            }

       
        }, "SignalREvent");

        notifier.subscribe($scope, function(event, data) {
            logit(event, data);
            toastService.showError(data);
        }, "SignalRError");

        notifier.subscribe($scope, function(event, data) {
            var message = "There was a problem retrieving your data";
            logit(event, message);
            toastService.showError(message);
        }, "HttpError");


        // signalR Listener
        var listener = signalRListener(scConfig.service_control_url + "messagestream");

        listener.subscribe($scope, function(message) {
            notifier.notify("SignalREvent", message);
        }, "SignalREvent");

        listener.subscribe($scope, function(message) {
            notifier.notify("SignalRError", message);
        }, "SignalRError");

        listener.subscribe($scope, function(message) {
            notifier.notify("CustomChecksUpdated", message.failed);
        }, "CustomChecksUpdated");

        listener.subscribe($scope, function(message) {
            notifier.notify("MessageFailuresUpdated", message.total);
        }, "MessageFailuresUpdated");

        listener.subscribe($scope, function(message) {
            notifier.notify("HeartbeatsUpdated", {
                failing: message.failing,
                active: message.active
            });
        }, "HeartbeatsUpdated");

        listener.subscribe($scope, function(message) {
            notifier.notify("EventLogItemAdded", message);
        }, "EventLogItemAdded");

        listener.subscribe($scope, function(message) {
            notifier.notify("MessagesSubmittedForRetry", message);
        }, "MessagesSubmittedForRetry");

        listener.subscribe($scope, function (message) {
            notifier.notify("FailedMessageGroupArchived", message);
        }, "FailedMessageGroupArchived");

        
    };

    controller.$inject = [
        "$scope",
        "$log",
        "$timeout",
        "$location",
        "$window",
        "serviceControlService",
        "version",
        "toastService",
        "signalRListener",
        "notifyService",
        "semverService",
        "scConfig",
        "sharedDataService"
    ];

    angular.module("sc").controller("AppCtrl", controller);

}(window, window.angular));