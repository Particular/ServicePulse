(function (window, angular) {
    'use strict';

    angular.module('ui.particular.duration', [])
        .filter('duration', ['formatter', function (formatter) {
            return function (input) {
                var time = formatter.formatTime(input);
                return `${time.value} ${time.unit}`;
            };
        }])
        .filter('durationValue', ['formatter', function (formatter) {
            return function (input) {
                return formatter.formatTime(input).value;
            };
        }])
        .filter('durationUnit', ['formatter', function (formatter) {
            return function (input) {
                return formatter.formatTime(input).unit;
            };
        }]);
}(window, window.angular));