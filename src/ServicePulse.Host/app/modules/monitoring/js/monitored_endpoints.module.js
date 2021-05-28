(function (window, angular) {
    'use strict';
    angular.module('monitored_endpoints', []);

    require('./services/services.monitoring');
    require('./services/services.connectivityNotifier');
    require('./services/services.endpointGrouping');
    require('./monitored_endpoints.controller');
    require('./monitored_endpoints.route.js');
    require('./constant.diagrams.js');

    require('./directives/ui.particular.monitoringConnectivityStatus.js');
    require('./directives/ui.particular.graph.js');
    require('./directives/ui.particular.graphdecimal.js');
    require('./directives/ui.particular.graphduration.js');
    require('./directives/ui.particular.metricsLargenumber.js');
    require('./directives/ui.particular.sortableColumn.js');
    
}(window, window.angular));