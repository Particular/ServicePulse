; (function (window, angular, undefined) {
    'use strict';

    function link(scope, element, attrs) {
        element.bind('click', function (e) {
            var message = attrs.confirmClick;
            if (message && !confirm(message)) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        });
    }

    function Directive () {

        var directive = {
            priority: -1,
            link: link,
            restrict: 'EA'
        };

        return directive;
    }

    angular
        .module('ui.particular.confirmClick', [])
        .directive('confirmClick', Directive);

} (window, window.angular));