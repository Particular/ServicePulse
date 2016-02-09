;
(function(window, angular, undefined) {
    'use strict';

    function Directive() {

        return {
            scope: {
                href: '@',
                icon: '@',
                text: '@',
                totalFailures: '='
            },
            restrict: 'E',
            replace: true,
            templateUrl: 'js/directives/ui.particular.hud.tpl.html',
        };
    }

    angular
        .module('ui.particular.hud', [])
        .directive('spHud', Directive);

}(window, window.angular));