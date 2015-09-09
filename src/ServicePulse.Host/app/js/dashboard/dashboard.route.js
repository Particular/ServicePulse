(function () {
    'use strict';

    angular.module('dashboard')
        .config([
            '$routeProvider', function ($routeProvider) {
                $routeProvider.when('/dashboard', { templateUrl: 'js/dashboard/dashboard.tpl.html', controller: 'DashboardCtrl' });
            }
        ]);

})();