(function(window, angular, undefined) {
    'use strict';

    angular.module('endpoint_details', []);

    require('./services/services.messageTypeParser');
    require('./services/services.connectivityNotifier');
    require('./endpoint_details.controller');
    require('./endpoint_details.route.js');
    require('./constant.diagrams.js');

    require('./directives/ui.particular.graph.js');
    require('./directives/ui.particular.graphdecimal.js');
    require('./directives/ui.particular.duration.js');
    require('./directives/ui.particular.graphduration.js');
    require('./directives/ui.particular.largeGraph.js');
    require('./directives/ui.particular.metricslargenumber.js');
}(window, window.angular));