(function (window, angular) {
    'use strict';

    require('angular');

    function directive($rootScope) {
        const template = require('./ui.particular.reindexingstatus.tpl.html');

        return {
            scope: {
                busyReindexingDatabase: '@'
            },
            restrict: 'E',
            replace: true,
            template: template,
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