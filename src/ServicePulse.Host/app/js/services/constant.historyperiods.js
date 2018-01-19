; (function (window, angular, undefined) {
    'use strict';

    angular.module('sc').constant('historyPeriods', [
        { value: 1, text: "1m", refreshInterval: 1*1000 },
        { value: 5, text: "5m", refreshInterval: 5*1000 },
        { value: 10, text: "10m", refreshInterval: 10*1000 },
        { value: 15, text: "15m", refreshInterval: 15*1000 },
        { value: 30, text: "30m", refreshInterval: 30*1000 },
        { value: 60, text: "1h", refreshInterval: 60*1000 }
    ]);
} (window, window.angular));