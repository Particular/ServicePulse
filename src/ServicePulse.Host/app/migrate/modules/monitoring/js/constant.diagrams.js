(function (window, angular) {
    'use strict';

    angular.module('monitored_endpoints')
        .constant('largeGraphsMinimumYAxis', {
                'queueLength': 10,
                'throughputRetries': 10,
                'processingCritical': 10,
            })
        .constant('smallGraphsMinimumYAxis', {
            'queueLength': 10,
            'throughput': 10,
            'retries': 10,
            'processingTime': 10,
            'criticalTime': 10,
        });

}(window, window.angular));
