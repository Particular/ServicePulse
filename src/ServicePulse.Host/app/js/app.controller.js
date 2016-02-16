; (function (window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $log,
        $timeout,
        $location,
        serviceControlService,
        version,
        toastService,
        signalRListener,
        notifyService,
        semverService,
        scConfig,
        sharedDataService
        ) {

        var scVersionSupportingExceptionGroups = '1.6.0';

        serviceControlService.getVersion()
            .then(function (scVersion) {
                $scope.SCVersion = scVersion;
                if (!semverService.isSupported(scVersion, scVersionSupportingExceptionGroups)) {
                    var scNeedsUpgradeMessage = 'You are using Service Control version ' + scVersion + '. Please, upgrade to version ' + scVersionSupportingExceptionGroups + ' or higher to unlock new functionality in ServicePulse.';
                    toastService.showError(scNeedsUpgradeMessage);
                }
        });

        serviceControlService.checkLicense().then(function (isValid) {
            if (!isValid) {
                toastService.showError('Your license has expired. Please contact Particular Software support at: <a href="http://particular.net/support">http://particular.net/support</a>');
            }
        });

        $scope.isActive = function (viewLocation) {
            var active = (viewLocation === $location.path());
            return active;
        };

        $scope.Version = version;

        $scope.$on('$routeChangeError', function (event, current, previous, rejection) {
            toastService.showError('Route change error');
        });

        function customChecksUpdated(event, data) {
            $timeout(function () { //http://davidburgosonline.com/dev/2014/correctly-fix-angularjs-error-digest-already-in-progress/
                data = (data === 0 || data === '0') ? undefined : data;
                $scope.failedcustomchecks = data;
                logit(data);
            });
        }

        function messageFailuresUpdated(event, data) {
            $timeout(function () {
                data = (data === 0 || data === '0') ? undefined : data;
                $scope.failedmessages = data;
                logit(data);
            });
        }

        function heartbeatsUpdated(event, data) {
            $timeout(function () {
                data = (data === 0 || data === '0') ? undefined : data;
                $scope.failedheartbeats = data.failing;
                logit(data);
            });
        }

        function logit(data) {
            $log.debug(data);
        }

        var notifier = notifyService();

        notifier.subscribe($scope, customChecksUpdated, 'CustomChecksUpdated');
        notifier.subscribe($scope, messageFailuresUpdated, 'MessageFailuresUpdated');
        notifier.subscribe($scope, heartbeatsUpdated, 'HeartbeatsUpdated');

        notifier.subscribe($scope, function(event, data) {
            logit(data);
            if (data === 'SignalR started') {
                toastService.showInfo(data);
            } else {
                toastService.showWarning(data);
            }
        }, 'SignalREvent');

        notifier.subscribe($scope, function(event, data) {
            logit(data);
            toastService.showError(data);
        }, 'SignalRError');

        notifier.subscribe($scope, function (event, data) {
            var message = 'There was a problem retrieving your data';
            logit(message);
            toastService.showError(message);
        }, 'HttpError');


        // signalR Listener
        var listener = signalRListener(scConfig.service_control_url + 'messagestream');

        //listener.subscribe($scope, function (message) {
        //    notifier.notify('messageArrived', {
        //        title: message.title,
        //        body: JSON.stringify(message)
        //    });

        //    toastService.showToast(message.title);
        //});
        

        listener.subscribe($scope, function (message) {
            notifier.notify('SignalREvent', message);
        }, 'SignalREvent');

        listener.subscribe($scope, function (message) {
            notifier.notify('SignalRError', message);
        }, 'SignalRError');

        listener.subscribe($scope, function (message) {
            notifier.notify('CustomChecksUpdated', message.failed);
        }, 'CustomChecksUpdated');

        listener.subscribe($scope, function (message) {
            notifier.notify('MessageFailuresUpdated', message.total);
        }, 'MessageFailuresUpdated');

        listener.subscribe($scope, function (message) {
            notifier.notify('HeartbeatsUpdated', {
                failing: message.failing,
                active: message.active
            });
        }, 'HeartbeatsUpdated');

        listener.subscribe($scope, function (message) {
            notifier.notify('EventLogItemAdded', message);
        }, 'EventLogItemAdded');
    };

    controller.$inject = [
        '$scope',
        '$log',
        '$timeout',
        '$location',
        'serviceControlService',
        'version',
        'toastService',
        'signalRListener',
        'notifyService',
        'semverService',
        'scConfig',
        'sharedDataService'
    ];

    angular.module('sc').controller('AppCtrl', controller);

} (window, window.angular));