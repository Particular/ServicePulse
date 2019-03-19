//require("jquery");

//export default class ConnectionFactory {

//    constructor() {
//        this.state = "duke";
//    }
//}

;
(function (window, angular, $, undefined) {
    'use strict';

    function connectionFactory() {

        let qs = {};

        let hashQs = decodeURIComponent(window.location.hash).split('?');
        if (hashQs.length === 2) {
            let segments = hashQs[1].split(';');
            for (var i = 0; i < segments.length; i++) {
                let segment = segments[i].split('=');
                qs[segment[0]] = segment[1];
            }
        }

        console.log(qs);

        this.getMonitoringUrls = function () {

            console.debug('getMonitoringUrls');
            let mus = qs['mus'];
            if (mus && mus !== null) {
                console.log('Monitoring Urls found in QS: ', mus);
                return mus;
            }

            console.debug('returning default Monitoring Url: ', window.defaultConfig.monitoring_urls);
            return window.defaultConfig.monitoring_urls;
        };

        this.getServiceControlUrl = function () {

            console.debug('getServiceControlUrl');
            let csu = qs['csu'];
            if (csu && csu !== null) {
                console.log('ServiceControl Url found in QS: ', csu);
                return csu;
            }

            console.log('returning default SC Url: ', window.defaultConfig.service_control_url);
            return window.defaultConfig.service_control_url;
        };
    }

    window.connectionFactory = new connectionFactory();
    angular.module('configuration')
        .service('connectionFactory', window.connectionFactory);

}(window, window.angular, window.jQuery));