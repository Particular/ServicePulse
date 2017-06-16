;(function (window, angular, undefined) {  'use strict';

    angular.module('sc')
        .constant('version', '1.2.0')
        .constant('showPendingRetry', false)
        .constant('scConfig', {
            service_control_url: 'http://localhost:33333/api/',
            monitoring_url: 'http://localhost:1234/diagrams/'
        });

}(window, window.angular));
