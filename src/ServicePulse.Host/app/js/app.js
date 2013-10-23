'use strict';

angular.module('sc', [
    'ngRoute',
    'ui.select2',
    'sc.filters',
    'sc.services',
    'sc.directives',
    'sc.controllers',
    'failedMessages',
    'heartbeats',
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