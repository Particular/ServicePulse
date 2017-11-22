(function (window, angular, undefined) {
    'use strict';
    angular.module('monitored_endpoints', []);

    require('./services/services.monitoring');
    require('./monitored_endpoints.controller');
    require('./monitored_endpoints.route.js');

    require('./directives/ui.particular.graph.js');
    require('./directives/ui.particular.graphdecimal.js');
    require('./directives/ui.particular.graphduration.js');
}(window, window.angular));