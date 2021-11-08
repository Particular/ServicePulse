(function (window, angular) {
    'use strict';

    angular.module('configuration.platformconnection', []);

    require('./platformconnection.route');
    require('./platformconnection.controller');
    require('./platformconnection.service');

}(window, window.angular));