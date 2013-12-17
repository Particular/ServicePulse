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
    'eventLogItems',
    'failedMessages',
    'endpoints',
    'customChecks',
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

angular.module('sc').controller('AppCtrl', ['$scope', 'notifications', function ($scope, notifications) {

    $scope.notifications = notifications;

    $scope.removeNotification = function (notification) {
        notifications.remove(notification);
    };
    
    if (new Date() > new Date(2014, 2, 10)) {
        notifications.pushSticky('<h4>Beta period has elapsed!</h4>Continued use is of this version of ServicePulse is unauthorized. To receive the latest and licensed release of ServicePulse please go to <a href="http://particular.net/downloads">http://particular.net/downloads</a>', 'info');
    }

    $scope.$on('$routeChangeError', function (event, current, previous, rejection) {
        notifications.pushForCurrentRoute('Route change error', 'error', {}, { rejection: rejection });
    });
}]);