; (function (window, angular, undefined) {
    'use strict';

    angular.module('configuration.connections', []);

    require('./connections.route');
    require('./connections.controller');
    require('./connections.service');

}(window, window.angular));