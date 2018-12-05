; (function (window, angular, undefined) {
    'use strict';

    angular.module('configuration', []);

    require('./configuration.controller');
    require('./configuration.route');
    require('./configuration.service');

    require('./directives/ui.particular.configurationTabs');

<<<<<<< HEAD
    require('./license/license.module');

=======
>>>>>>> Bind tabs control
    angular.module('configuration', [
        'ui.bootstrap',
        'configuration.route',
        'configuration.controller',
        'configuration.service',
<<<<<<< HEAD
        'configuration.tabs',
        'configuration.license'
=======
        'configuration.tabs'
>>>>>>> Bind tabs control
    ]);

} (window, window.angular));