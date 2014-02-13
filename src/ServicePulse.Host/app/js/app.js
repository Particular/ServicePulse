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
    '$scope', 'notifications', function($scope, notifications) {

        $scope.notifications = notifications;

        $scope.removeNotification = function(notification) {
            notifications.remove(notification);
        };

        $scope.$on('$routeChangeError', function(event, current, previous, rejection) {
            notifications.pushForCurrentRoute('Route change error', 'error', {}, { rejection: rejection });
        });
    }
]);