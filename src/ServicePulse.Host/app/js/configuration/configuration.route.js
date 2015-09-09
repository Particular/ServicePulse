(function () {
    'use strict';

    angular.module('configuration')
        .config([
            '$routeProvider', function ($routeProvider) {
                $routeProvider.when('/configuration', { templateUrl: 'js/configuration/configuration.tpl.html', controller: 'ConfigurationCtrl' });
            }
        ]);

})();