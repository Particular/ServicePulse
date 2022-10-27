(function (window, angular) {
    'use strict';

    function directive() {
        return {
            scope: {
                type: '@'
            },
            restrict: 'EA',
            replace: true,
            templateUrl: 'angular/directives/ui.particular.exclamation.tpl.html',
            link: function (scope, element) { }
        };
    }

    directive.$inject = [];

    angular.module('ui.particular.exclamation', [])
        .directive('exclamation', directive);

}(window, window.angular));