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
    'services.platformUpdateService',
    'services.semverService',
    'services.notifications',
    'services.exceptionHandler',
    'directives.moment',
    'directives.hud',
    'directives.eatClick',
    'directives.productVersion',
    'eventLogItems',
    'failedMessages',
    'endpoints',
    'customChecks',
    'configuration',
    'dashboard']);

angular.module('sc')
    .constant('version', '1.2.0-productversion')
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
    }
]);