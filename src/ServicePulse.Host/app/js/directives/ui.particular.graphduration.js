(function (window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.graphduration', [])
        .filter('graphduration', ['formatter', function (formatter) {
            return function (input) {
                if (input) {
                    input.displayValue = formatter.formatTime(input.average);
                }

                return input;
            };
        }]);
}(window, window.angular));