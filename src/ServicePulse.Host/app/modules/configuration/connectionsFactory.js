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

        let mus = null;
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

        this.getMonitoringUrls = function () {

            console.debug('getMonitoringUrls');
            if (mus && mus !== null) {
                console.debug('returning previously retrievd Monitoring Urls: ', mus);
                return mus;
            }

            mus = qs['mus'];
            if (mus && mus !== null) {
                console.debug('Monitoring Urls found in QS: ', mus);
                window.localStorage.setItem('mus', mus);
                console.debug('Monitoring Urls local storage value aligned with QS.');
                return mus;
            }

            mus = window.localStorage.getItem('mus');
            if (mus && mus !== null) {
                console.debug('Monitoring Urls found in local storage: ', mus);
                qs['mus'] = mus;
                rebuildHash();
                return mus;
            }

            console.debug('returning default Monitoring Url: ', window.defaultConfig.monitoring_urls);
            return window.defaultConfig.monitoring_urls;
        };

        this.getServiceControlUrl = function () {

            console.debug('getServiceControlUrl');
            if (scu && scu !== null) {
                console.debug('returning previously retrievd ServiceControl Url: ', scu);
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

            console.debug('returning default SC Url: ', window.defaultConfig.service_control_url);
            return window.defaultConfig.service_control_url;
        };
    }

    window.connectionFactory = new connectionFactory();
    angular.module('configuration')
        .service('connectionFactory', window.connectionFactory);

}(window, window.angular, window.jQuery));