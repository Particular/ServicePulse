(function (window, angular) {
    'use strict';

    angular.module('configuration.alerting', []);

    require('./alerting.route');
    require('./alerting.controller');
    require('./alerting.service');

}(window, window.angular));