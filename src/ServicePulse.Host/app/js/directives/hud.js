angular.module('directives.hud', [])
    .directive('spHud', function($timeout) {
        return {
            scope: {
                href: '@',
                icon: '@',
                text: '@',
                totalFailures: '='
            },
            restrict: 'E',
            replace: true,
            templateUrl: 'js/directives/hud.tpl.html',
            link: function (scope, element) {
                
                scope.$watch('totalFailures', function (newValue, oldValue) {
                    if (newValue === 0) {
                        element.removeClass('quick-button-animate');
                    } else if (newValue > oldValue) {
                        element.removeClass('quick-button-animate');

                        //Need to do this in a timeout otherwise the animation does not fire!
                        $timeout(function () {
                            element.addClass('quick-button-animate');
                        }, 500);
                    }
                });
            }
        };
    });
