(function (window, angular) {
    'use strict';

    angular.module('configuration.notifications', []);

    require('./notifications.route');
    require('./notifications.controller');
    require('./notifications.service');
    require('./emailnotifications.controller');

}(window, window.angular));