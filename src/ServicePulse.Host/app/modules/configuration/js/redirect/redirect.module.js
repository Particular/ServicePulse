; (function (window, angular, undefined) {
    'use strict';

    angular.module('configuration.redirect', []);

    require('./redirectmodal.service');

    require('./redirect.route');
    require('./redirect.controller');
    require('./redirect.service');

    require('./editredirect.controller');
}(window, window.angular));