﻿(function (window, angular, undefined) {
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
                return formatter.timeValue(input);
            };
        }])
        .filter('durationUnit', ['formatter', function (formatter) {
            return function (input) {
                return formatter.timeUnit(input);
            };
        }]);
}(window, window.angular));