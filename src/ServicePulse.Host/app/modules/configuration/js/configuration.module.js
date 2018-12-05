; (function (window, angular, undefined) {
    'use strict';

    angular.module('configuration', []);

    require('./configuration.controller');
    require('./configuration.route');
    require('./configuration.service');

    require('./directives/ui.particular.configurationTabs');
    require('./directives/ui.particular.redirectLink');

    require('./redirect/redirect.module');

    angular.module('configuration', [
        'ui.bootstrap',
        'configuration.route',
        'configuration.controller',
        'configuration.service',
        'configuration.tabs',
        'configuration.redirect'
    ]);

} (window, window.angular));