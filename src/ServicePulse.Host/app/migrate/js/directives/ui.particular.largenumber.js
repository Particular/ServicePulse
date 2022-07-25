(function(window, angular) {
	'use strict';

    angular.module('ui.particular.largenumber', [])
        .filter('largeNumber', ['formatter', function (formatter) {
            return function (input, decimals) {
                return formatter.formatLargeNumber(input, decimals);
            };
        }]);
}(window, window.angular));