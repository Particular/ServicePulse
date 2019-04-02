require('url-search-params-polyfill');
//require("jquery");

//export default class connectionsManager {

//    constructor() {
//        this.state = "duke";
//    }
//}

;
(function (window, angular, $, undefined) {
    'use strict';

    function connectionsManager() {

        let scu = null;
        let mu = null;

        var urlParams = new URLSearchParams(window.location.search);

        if (urlParams.has('scu')) {
            scu = urlParams.get('scu');
            window.localStorage.setItem('scu', scu);
            console.debug('ServiceControl Url found in QS and stored in local storage: ', scu);
        } else if (window.localStorage.getItem('scu')) {
            scu = window.localStorage.getItem('scu');
            console.debug('ServiceControl Url, not in QS, found in local storage: ', scu);
        } else if (window.defaultConfig && window.defaultConfig.service_control_url) {
            scu = window.defaultConfig.service_control_url;
            console.debug('setting ServiceControl Url to its default value: ', window.defaultConfig.service_control_url);
        } else {
            console.error('ServiceControl Url is not defined.');
        }

        if (urlParams.has('mu')) {
            mu = urlParams.get('mu');
            window.localStorage.setItem('mu', mu);
            console.debug('Monitoring Url found in QS and stored in local storage: ', mu);
        } else if (window.localStorage.getItem('mu')) {
            mu = window.localStorage.getItem('mu');
            console.debug('Monitoring Url, not in QS, found in local storage: ', mu);
        } else if (window.defaultConfig && window.defaultConfig.monitoring_urls && window.defaultConfig.monitoring_urls.length) {
            mu = window.defaultConfig.monitoring_urls[0];
            console.debug('setting Monitoring Url to its default value: ', window.defaultConfig.monitoring_urls);
        } else {
            console.warn('Monitoring Url is not defined.');
        }

        this.getMonitoringUrl = function () { return mu; };
        this.getServiceControlUrl = function () { return scu; };
        this.updateConnections = function (serviceControlUrl, monitoringUrl) {

            if (!serviceControlUrl) {
                throw 'ServiceControl URL is mandatory';
            }

            urlParams.set('scu', serviceControlUrl);

            if (monitoringUrl) {
                urlParams.set('mu', monitoringUrl);
            } else {
                urlParams.delete('mu');
            }

            //values have changed. They'll be reset after page reloads
            window.localStorage.removeItem('scu');
            window.localStorage.removeItem('mu');

            let newSearch = urlParams.toString();
            console.debug('updateConnections - new query string: ', newSearch);
            window.location.search = newSearch;
        };
    }

    window.connectionsManager = new connectionsManager();
    angular.module('configuration')
        .service('connectionsManager', function () { return window.connectionsManager; });

}(window, window.angular, window.jQuery));