(function (window, angular) {
    'use strict';

    function directive() {
        return {
            scope: {
                message: '@'
            },
            restrict: 'E',
            replace: true,
            templateUrl: 'js/directives/ui.particular.busy.tpl.html',
            link: function (scope, element) { }
        };
    }

    directive.$inject = [];

    angular.module('ui.particular.busy', [])
        .directive('busy', directive);

}(window, window.angular));