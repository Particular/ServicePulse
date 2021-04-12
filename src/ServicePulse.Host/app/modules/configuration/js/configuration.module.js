(function (window, angular) {
    'use strict';
    
    angular.module('configuration', []);

    require('./configuration.route');
    require('./configuration.service');

    require('./directives/ui.particular.configurationTabs');
    require('./directives/ui.particular.redirectLink');

    require('./license/license.module');

    require('./redirect/redirect.module');

    require('./connections/connections.module');

    require('./alerting/alerting.module');

    angular.module('configuration', [
        'ui.bootstrap',
        'configuration.route',
        'configuration.service',
        'configuration.tabs',
        'configuration.redirect',
        'configuration.license',
        'configuration.connections',
        'configuration.alerting'
    ]);

} (window, window.angular));