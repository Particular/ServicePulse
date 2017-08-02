; (function (window, angular, undefined) {
    'use strict';

    angular.module('sc').constant('historyPeriods', [
        { value: 5, text: "Last 5 min." },
        { value: 10, text: "Last 10 min." },
        { value: 15, text: "Last 15 min." },
        { value: 30, text: "Last 30 min." },
        { value: 60, text: "Last hour" }
    ]);
} (window, window.angular));