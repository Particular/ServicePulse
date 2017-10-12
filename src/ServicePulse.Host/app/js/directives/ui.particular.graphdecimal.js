(function (window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.graphdecimal', [])
        .filter('graphdecimal', ['formatter', function (formatter) {
            return function (input) {
                if (input) {
                    input.displayValue = formatter.formatLargeNumber(input.lastValue, 0);
                } else {
                    input = {
                        points: [],
                        average: 0,
                        displayValue: 0
                    };
                }

                return input;
            };
        }]);
}(window, window.angular));