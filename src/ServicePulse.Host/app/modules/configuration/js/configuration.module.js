; (function (window, angular, undefined) {
    'use strict';

    angular.module('configuration', []);

    require('./configuration.controller');
    require('./configuration.route');
    require('./configuration.service');

    require('./directives/ui.particular.configurationTabs');
    require('./directives/ui.particular.redirectLink');

    require('./redirect/redirect.module');

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
<<<<<<< HEAD
        'configuration.tabs',
        'configuration.license'
=======
        'configuration.tabs'
>>>>>>> Bind tabs control
=======
        'configuration.tabs',
        'configuration.redirect'
>>>>>>> Move redirects
    ]);

} (window, window.angular));