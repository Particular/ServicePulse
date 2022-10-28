(function (window, angular) {
    'use strict';

    function directive() {
        return {
            scope: {
                message: '@'
            },
            restrict: 'E',
            replace: true,
            templateUrl: 'js/directives/ui.particular.nodata.tpl.html',
            link: function (scope, element) { }
        };
    }

    directive.$inject = [];

    angular.module('ui.particular.nodata', [])
        .directive('noData', directive);

}(window, window.angular));