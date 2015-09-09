(function (window, angular, undefined) {
    'use strict';

    function controller (
        $scope,
        notifications,
        serviceControlService,
        version
        ) {

        serviceControlService.getVersion().then(function(sc_version) {
            $scope.SCVersion = sc_version;
        });

        serviceControlService.checkLicense().then(function(isValid) {
            if (!isValid) {
                notifications.pushSticky('Your license has expired. Please contact Particular Software support at: <a href="http://particular.net/support">http://particular.net/support</a>', 'error');
            }
        });

        $scope.Version = version;

        $scope.notifications = notifications;

        $scope.removeNotification = function(notification) {
            notifications.remove(notification);
        };

        $scope.$on('$routeChangeError', function(event, current, previous, rejection) {
            notifications.pushForCurrentRoute('Route change error', 'error', {}, { rejection: rejection });
        });
    };

    controller.$inject = [
        '$scope', 'notifications', 'serviceControlService', 'version'
    ];

    angular.module('sc').controller('AppCtrl', controller);

}(window, window.angular));