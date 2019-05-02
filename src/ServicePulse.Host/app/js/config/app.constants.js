;(function (window, angular, undefined) {  'use strict';

    window.config = {
        default_route: '/dashboard',
        service_control_url: 'http://localhost:33333/api/',
        monitoring_urls: ['http://localhost:33633/']
    };

    angular.module('sc')
        .constant('version', '1.2.0')
        .constant('showPendingRetry', false)
        .constant('scConfig', window.config);

}(window, window.angular));
