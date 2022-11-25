(function (window, angular) {
    'use strict';

    angular.module('configuration.redirect', []);

    require('./redirect.route');
    require('./redirect.controller');
    require('./redirect.service');
    require('./redirectmodal.service');

    require('./editredirect.controller');
}(window, window.angular));