(function (window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.graphdecimal', [])
        .filter('graphdecimal', ['formatter', function (formatter) {
            return function (input) {
                if (input) {
                    var lastValue = input.points.length > 0 ? input.points[input.points.length - 1] : 0;
                    input.displayValue = formatter.formatLargeNumber(lastValue, 0);
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
