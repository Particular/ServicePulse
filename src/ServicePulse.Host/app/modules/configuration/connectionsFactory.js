//require("jquery");

//export default class ConnectionFactory {

//    constructor() {
//        this.state = "duke";
//    }
//}

;
(function (window, $, undefined) {
    'use strict';

    function connectionFactory() {

        this.getMonitoringUrls = function () {
            return window.config.monitoring_urls;
        };

        this.getServiceControlUrl = function () {
            return window.config.service_control_url;
        };
    }

    window.connectionFactory = new connectionFactory();

}(window, window.jQuery));