(function(window, angular) {
    'use strict';

    function directive() {

        return {
            scope: {
                href: '@',
                icon: '@',
                text: '@',
                totalFailures: '='
            },
            restrict: 'E',
            replace: true,
            templateUrl: 'directives/ui.particular.hud.tpl.html',
        };
    }

    angular
        .module('ui.particular.hud', [])
        .directive('spHud', directive);

}(window, window.angular));