; (function (window, angular, undefined) {
    'use strict';

    function directive() {
        return {
            scope: {
                type: '@'
            },
            restrict: 'E',
            replace: true,
            templateUrl: 'js/directives/ui.particular.exclamation.tpl.html',
            link: function (scope, element) { }
        };
    };

    directive.$inject = [];

    angular.module('ui.particular.exclamation', [])
        .directive('exclamation', directive);

}(window, window.angular));