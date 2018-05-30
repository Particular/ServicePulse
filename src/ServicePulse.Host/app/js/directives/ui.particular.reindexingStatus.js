; (function (window, angular, undefined) {
    'use strict';

    function directive($rootScope) {
        return {
            scope: {
                busyReindexingDatabase: '@'
            },
            restrict: 'E',
            replace: true,
            templateUrl: 'js/directives/ui.particular.reindexingstatus.tpl.html',
            link: function (scope, element) {
                scope.busyReindexingDatabase = $rootScope.busyReindexingDatabase;

                scope.$watch(function () {
                    return $rootScope.busyReindexingDatabase;
                }, function () {
                    scope.busyReindexingDatabase = $rootScope.busyReindexingDatabase;
                }, true);
            }
        };
    }

    directive.$inject = ['$rootScope'];

    angular.module('ui.particular.reindexingstatus', [])
        .directive('reindexingstatus', directive);

} (window, window.angular));
