(function (window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.duration', [])
        .filter('duration', ['formatter', function (formatter) {
            return function (input) {
                return formatter.formatTime(input);
            };
        }]);
}(window, window.angular));