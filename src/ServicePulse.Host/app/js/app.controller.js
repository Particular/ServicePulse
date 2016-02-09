; (function (window, angular, undefined) {
    'use strict';

    function controller(
        $scope,
        $log,
        $timeout,
        $location,
        notifications,
        serviceControlService,
        version,
        toastService,
        signalRListener,
        notifyService,
        scConfig
        ) {

        serviceControlService.getVersion().then(function (sc_version) {
            $scope.SCVersion = sc_version;
        });

        serviceControlService.checkLicense().then(function (isValid) {
            if (!isValid) {
                notifications.pushSticky('Your license has expired. Please contact Particular Software support at: <a href="http://particular.net/support">http://particular.net/support</a>', 'danger');
            }
        });

        $scope.isActive = function (viewLocation) {
            var active = (viewLocation === $location.path());
            return active;
        };

        $scope.Version = version;

        $scope.notifications = notifications;

        $scope.removeNotification = function (notification) {
            notifications.remove(notification);
        };

        $scope.$on('$routeChangeError', function (event, current, previous, rejection) {
            notifications.pushForCurrentRoute('Route change error', 'danger', {}, { rejection: rejection });
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
            toastService.showToast(data);
            $log.debug(data);
        }

        var notifier = notifyService();

        notifier.subscribe($scope, customChecksUpdated, 'CustomChecksUpdated');
        notifier.subscribe($scope, messageFailuresUpdated, 'MessageFailuresUpdated');
        notifier.subscribe($scope, heartbeatsUpdated, 'HeartbeatsUpdated');
        notifier.subscribe($scope, function (event, data) { logit(data); }, 'SignalREvent');
        notifier.subscribe($scope, function (event, data) { logit(data); }, 'SignalRError');
        notifier.subscribe($scope, function (event, data) { logit('There was a problem retrieving your data'); }, 'HttpError');


        // signalR Listener
        //var listener = signalRListener(scConfig.service_control_url);
        var listener = signalRListener('http://localhost:33333/api/messagestream');

            

        listener.subscribe($scope, function (message) {
            notifier.notify('messageArrived', {
                title: message.title,
                body: JSON.stringify(message)
            });

            toastService.showToast(message.title);
        });

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
        'notifications',
        'serviceControlService',
        'version',
        'toastService',
        'signalRListener',
        'notifyService',
        'scConfig'
    ];

    angular.module('sc').controller('AppCtrl', controller);

} (window, window.angular));