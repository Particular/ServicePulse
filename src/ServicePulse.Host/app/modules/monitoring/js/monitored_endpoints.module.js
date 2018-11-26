(function (window, angular, undefined) {
    'use strict';
    angular.module('monitored_endpoints', []);

    require('./services/services.monitoring');
    require('./services/services.connectivityNotifier');
    require('./monitored_endpoints.controller');
    require('./monitored_endpoints.route.js');
    require('./constant.diagrams.js');

    require('./directives/ui.particular.monitoringConnectivityStatus.js');
    require('./directives/ui.particular.graph.js');
    require('./directives/ui.particular.graphdecimal.js');
    require('./directives/ui.particular.graphduration.js');
    require('./directives/ui.particular.metricslargenumber.js');
}(window, window.angular));