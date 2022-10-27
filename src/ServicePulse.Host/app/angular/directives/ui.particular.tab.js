(function (window, angular) {
    'use strict';
    
    function Directive($window) {

        var directive = {
            restrict: 'E',
            transclude: true,
            template: '<div role="tabpanel" ng-show="active" ng-transclude></div>',
            require: '^tabset',
            scope: {
                heading: '@',
                name: '@',
                active: '='
            },
            link: function (scope, elem, attr, tabsetCtrl) {
                scope.active = false;

                scope.disabled = false;
                if (attr.disable) {
                    attr.$observe('disable', function (value) {
                        scope.disabled = (value !== 'false');
                    });
                }

                tabsetCtrl.addTab(scope);
            }
        };
        return directive;
    }

    Directive.$inject = ['$window'];

    angular
        .module('ui.particular.tabset')
        .directive('tab', Directive);

} (window, window.angular));
