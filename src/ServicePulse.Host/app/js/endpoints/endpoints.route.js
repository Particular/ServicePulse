(function () {
    'use strict';

    angular.module('endpoints')
     .config([
        '$routeProvider', function ($routeProvider) {
            $routeProvider.when('/endpoints', { templateUrl: 'js/endpoints/endpoints.tpl.html', controller: 'EndpointsCtrl' });
        }
     ]);

})();