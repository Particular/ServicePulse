;
(function(window, angular, undefined) {
    'use strict';

    function Directive($timeout, $animate) {

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
            link: function(scope, element) {

                scope.$watch('totalFailures', function(newValue, oldValue) {
                    if (newValue === 0) {
                        $animate.removeClass(element, 'quick-button-animate');
                    } else if (newValue > oldValue) {
                        $animate.removeClass(element, 'quick-button-animate');
                        $animate.addClass(element, 'quick-button-animate');
                    }
                });
            }
        };
    }

    Directive.$inject = ['$timeout', '$animate'];

    angular
        .module('ui.particular.hud', [])
        .directive('spHud', Directive);

}(window, window.angular));