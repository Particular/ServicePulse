; (function (window, angular, undefined) {
    'use strict';

    angular.module('sc')
        .service('rx', function () {
            return Rx;
        });
} (window, window.angular));