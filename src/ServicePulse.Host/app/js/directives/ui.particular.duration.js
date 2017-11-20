(function (window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.duration', [])
        .filter('duration', ['formatter', function (formatter) {
            return function (input, timeFormatOption) {
                return formatter.formatTime(input, timeFormatOption);
            };
        }]);
}(window, window.angular));