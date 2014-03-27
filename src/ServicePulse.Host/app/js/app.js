'use strict';

angular.module('sc', [
    'ngRoute',
    'ngAnimate',
    'ngSanitize',
    'ngClipboard',
    'ui.bootstrap',
    'infinite-scroll',
    'services.streamService',
    'services.serviceControlService',
    'services.notifications',
    'services.exceptionHandler',
    'directives.moment',
    'directives.hud',
    'directives.eatClick',
    'eventLogItems',
    'failedMessages',
    'endpoints',
    'customChecks',
    'configuration',
    'dashboard']);

angular.module('sc')
    .constant('version', '0.2.0-unstable147')
    .constant('scConfig', SC.config);

angular.module('sc')
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({ redirectTo: '/dashboard' });
}]);

angular.module('sc')
    .run(['$rootScope', '$log', function ($rootScope, $log) {
        $rootScope.$log = $log;
    }]);

angular.module('sc').controller('AppCtrl', [
    '$scope', 'notifications', 'serviceControlService', 'version', function ($scope, notifications, serviceControlService, version) {

        serviceControlService.getVersion().then(function(sc_version) {
            $scope.SCVersion = sc_version;
        });

        serviceControlService.checkLicense().then(function(isValid) {
            if (!isValid) {
                notifications.pushSticky('Your license has expired', 'error');
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
    }
]);