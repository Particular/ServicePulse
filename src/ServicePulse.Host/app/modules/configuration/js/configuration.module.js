; (function (window, angular, undefined) {
    'use strict';
    
    angular.module('configuration', []);

    require('./configuration.controller');
    require('./configuration.route');
    require('./configuration.service');

    require('./directives/ui.particular.configurationTabs');
    require('./directives/ui.particular.redirectLink');

    require('./redirect/redirect.module');

    require('./license/license.module');

    require('./redirect/redirect.module');

    angular.module('configuration', [
        'ui.bootstrap',
        'configuration.route',
        'configuration.controller',
        'configuration.service',
        'configuration.tabs',
<<<<<<< HEAD
        'configuration.redirect',
        'configuration.license',
=======
        'configuration.redirect'
>>>>>>> 4dd5e28409f156061afd66a8f05f34dba11f6bfd
    ]);

} (window, window.angular));