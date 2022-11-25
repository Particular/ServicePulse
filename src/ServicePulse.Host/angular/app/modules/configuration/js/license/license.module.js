(function (window, angular) {
    'use strict';

    angular.module('configuration.license', []);

    require('./license.route');
    require('./license.controller');
    require('./license.service');

} (window, window.angular));