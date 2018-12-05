; (function (window, angular, undefined) {
    'use strict';

    angular.module('configuration', []);

    require('./configuration.controller');
    require('./configuration.route');
    require('./configuration.service');

    require('./directives/ui.particular.configurationTabs');

    angular.module('configuration', [
        'ui.bootstrap',
        'configuration.route',
        'configuration.controller',
        'configuration.service',
        'configuration.tabs'
    ]);

} (window, window.angular));