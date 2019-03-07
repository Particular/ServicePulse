; (function (window, angular, undefined) {
    'use strict';
    
    function connectionsServiceProvider() {

        var scConfig = window.config;

        this.getCurrentScConfig = function () {

            //should look if there is a cookie or local storage that overrides the default

            return scConfig;
        };

        this.$get = function connectionsServiceFactory() {

            var svc = {};



            return svc;
        };

    }

    angular.module('configuration.connections')
        .provider('connectionsService', connectionsServiceProvider);

})(window, window.angular);