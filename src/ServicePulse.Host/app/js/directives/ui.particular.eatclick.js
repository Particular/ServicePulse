; (function (window, angular, $, undefined) {
    'use strict';

    function Directive() {

        return function (scope, element) {
            $(element).click(function (event) {
                event.preventDefault();
                event.stopPropagation();
            });
        };
    }

    angular
        .module('ui.particular.eatClick', [])
        .directive('eatClick', Directive);

}(window, window.angular, window.jQuery));