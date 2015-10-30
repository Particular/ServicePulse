;(function (window, angular, undefined) {  'use strict';

    angular.module('sc')
        .constant('version', '1.2.0')
        .constant('scConfig', {
            service_control_url: 'http://localhost:33333/api/',
            service_pulse_url: 'http://platformupdate.particular.net/servicepulse.txt'
        });

}(window, window.angular));