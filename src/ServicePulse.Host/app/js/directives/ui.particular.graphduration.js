(function (window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.graphduration', [])
        .filter('graphduration', ['formatter', function (formatter) {
            return function (input, timeFormatOption) {
                if (input) {
                    var lastValue = input.points.length > 0 ? input.points[input.points.length - 1] : 0;
                    input.displayValue = formatter.formatTime(lastValue, timeFormatOption);
                }

                return input;
            };
        }]);
}(window, window.angular));
