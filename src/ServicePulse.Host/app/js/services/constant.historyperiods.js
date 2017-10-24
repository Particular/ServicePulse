; (function (window, angular, undefined) {
    'use strict';

    angular.module('sc').constant('historyPeriods', [
        { value: 1, text: "Last 1 min.", refreshInterval: 1*1000 },
        { value: 5, text: "Last 5 min.", refreshInterval: 15*1000 },
        { value: 10, text: "Last 10 min.", refreshInterval: 30*1000 },
        { value: 15, text: "Last 15 min.", refreshInterval: 45*1000 },
        { value: 30, text: "Last 30 min.", refreshInterval: 90*1000 },
        { value: 60, text: "Last hour", refreshInterval: 180*1000 }
    ]);
} (window, window.angular));