var moment = require('moment');

(function (window, angular) {
    'use strict';

    angular.module('wrappers', []).constant('moment', moment);
} (window, window.angular));