(function (window, angular) {
    'use strict';

    angular.module('ui.particular.graphdecimal', [])
        .filter('graphdecimal', ['$filter', function ($filter) {
            return function (input, decimals) {
                if (input) {
                    var lastValue = input.points.length > 0 ? input.points[input.points.length - 1] : 0;
                    input.displayValue = $filter("metricslargenumber")(lastValue, decimals);
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
