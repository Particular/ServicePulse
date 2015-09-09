(function () {
    'use strict';

    angular.module('customChecks')
        .config([
            '$routeProvider', function ($routeProvider) {
                $routeProvider.when('/customChecks', { templateUrl: 'js/custom_checks/customChecks.tpl.html', controller: 'CustomChecksCtrl' });
            }
        ]);

})();