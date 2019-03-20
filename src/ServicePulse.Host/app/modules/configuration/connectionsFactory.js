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

        let mu = null;
        let scu = null;

        function extractQuerystringFromHash() {
            let temp = {};
            let hashQs = decodeURIComponent(window.location.hash).split('?');
            if (hashQs.length === 2) {
                let segments = hashQs[1].split(';');
                for (var i = 0; i < segments.length; i++) {
                    let segment = segments[i].split('=');
                    temp[segment[0]] = segment[1];
                }
            }

            return temp;
        }

        let qs = extractQuerystringFromHash();
        console.debug(qs);

        function rebuildHash() {
            //let currentHash = decodeURIComponent(window.location.hash).split('?');
            //if (currentHash.length === 1) {
            //    //there isn't a qs appended to hash
            //    let newHash = currentHash[0] + '?';
            //    for (var i = 0; i < qs.length; i++) {
            //        let element = qs[i];
            //        console.debug('element', element);
            //        newHash += element[0] + '=' + element[1] + ';';
            //    }
            //    let newEncodedHash = encodeURIComponent(newHash);
            //    window.location.hash = newEncodedHash;
            //}
            //else {
            //    //there is already a qs appended to the hash, need to decode, append and re-encode
            //}
        }

        this.getMonitoringUrl = function () {

            console.debug('getMonitoringUrl');
            if (mu && mu !== null) {
                console.debug('returning cached Monitoring Url: ', mu);
                return mu;
            }

            mu = qs['mu'];
            if (mu && mu !== null) {
                console.debug('Monitoring Url found in QS: ', mu);
                window.localStorage.setItem('mu', mu);
                console.debug('Monitoring Url local storage value aligned with QS.');
                return mu;
            }

            mu = window.localStorage.getItem('mu');
            if (mu && mu !== null) {
                console.debug('Monitoring Url found in local storage: ', mu);
                qs['mu'] = mu;
                rebuildHash();
                return mu;
            }

            if (window.defaultConfig.monitoring_urls && window.defaultConfig.monitoring_urls.length > 0) {
                mu = window.defaultConfig.monitoring_urls[0];
                console.debug('setting Monitoring Url to its default value: ', window.defaultConfig.monitoring_urls);
                return mu;
            }

            console.info('Monitoring Url is not defined, returning null.');
            return null;
        };

        this.getServiceControlUrl = function () {

            console.debug('getServiceControlUrl');
            if (scu && scu !== null) {
                console.debug('returning cached ServiceControl Url: ', scu);
                return scu;
            }

            scu = qs['scu'];
            if (scu && scu !== null) {
                console.debug('ServiceControl Url found in QS: ', scu);
                window.localStorage.setItem('scu', scu);
                console.debug('ServiceControl Url local storage value aligned with QS.');
                return scu;
            }

            scu = window.localStorage.getItem('scu');
            if (scu && scu !== null) {
                console.debug('ServiceControl Url found in local storage: ', scu);
                qs['scu'] = scu;
                rebuildHash();
                return scu;
            }

            if (window.defaultConfig.service_control_url) {
                scu = window.defaultConfig.service_control_url;
                console.debug('setting ServiceControl Url to its default value: ', window.defaultConfig.service_control_url);
                return scu;
            }

            console.info('ServiceControl Url is not defined, returning null.');
            return null;
        };
    }

    window.connectionFactory = new connectionFactory();
    angular.module('configuration')
        .service('connectionFactory', window.connectionFactory);

}(window, window.angular, window.jQuery));