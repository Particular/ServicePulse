(function (window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.duration', [])
        .filter('duration', ['formatter', function (formatter) {
            return function (input) {
                var time = formatter.formatTime(input);
                return `${time.value} ${time.unit}`;
            };
        }]);
}(window, window.angular));