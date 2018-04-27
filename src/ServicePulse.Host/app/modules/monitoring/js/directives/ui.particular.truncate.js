(function (window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.truncate', [])
        .filter('truncate', function () {
            return function (input, max) {

                var effectiveMax = max > 0 ? max : 40;

                if (input.length > effectiveMax) {
                    return "…" + input.substring(input.length - effectiveMax);
                }

                return input;
            };
        });
}(window, window.angular));