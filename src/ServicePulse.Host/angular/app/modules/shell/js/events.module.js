(function (window, angular) {
    'use strict';

    angular.module('events.module', []);
    require('./events.route.js');
    require('./events.controller');
    require('./services/service.auditLog.js');

} (window, window.angular));


