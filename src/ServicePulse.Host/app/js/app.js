'use strict';

angular.module('sc', ['sc.filters', 'sc.services', 'sc.directives', 'sc.controllers', 'ui.select2']);

angular.module('sc')
    .constant('scConfig', SC.config);

angular.module('sc')
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/heartbeatsStats', { templateUrl: 'partials/heartbeatsStats.html', controller: 'heartbeatsStats' });
        $routeProvider.when('/heartbeats', { templateUrl: 'partials/heartbeats.html', controller: 'heartbeats' });
        $routeProvider.when('/failedMessages', { templateUrl: 'partials/failedMessages.html', controller: 'failedMessages' });
        $routeProvider.otherwise({ redirectTo: '/heartbeatsStats' });
    }]);

angular.module('sc')
    .run(['$rootScope', '$log', function ($rootScope, $log) {
        $rootScope.$log = $log;
    }]);