'use strict';


// Declare app level module which depends on filters, and services
angular.module('sc', ['sc.filters', 'sc.services', 'sc.directives', 'sc.controllers'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/heartbeatsStats', { templateUrl: 'partials/heartbeatsStats.html', controller: 'heartbeatsStats' });
        $routeProvider.when('/heartbeats', { templateUrl: 'partials/heartbeats.html', controller: 'heartbeats' });
        $routeProvider.otherwise({ redirectTo: '/heartbeatsStats' });
    }])
    .run(['$rootScope', '$log', function ($rootScope, $log) {
        $rootScope.$log = $log;
    }]);
