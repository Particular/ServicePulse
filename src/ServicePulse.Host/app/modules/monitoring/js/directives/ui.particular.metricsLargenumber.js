﻿(function(window, angular) {
	'use strict';

    angular.module('ui.particular.metricslargenumber', [])
        .filter('largeNumber', ['formatter', function (formatter) {
            return function (input) {
                var decimals = 0;
                if (input < 10 || input > 1000000) {
                    decimals = 2;
                }
                return formatter.formatLargeNumber(input, decimals);
            };
        }]);
}(window, window.angular));