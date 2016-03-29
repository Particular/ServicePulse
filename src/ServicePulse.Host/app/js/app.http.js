; (function (angular) {
    'use strict';

    function httpProvider($httpProvider) {

        $httpProvider.defaults.headers.common['Accept'] = 'application/json, text/javascript';
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
        $httpProvider.defaults.useXDomain = true;

        $httpProvider.defaults.headers.patch = {
            'Accept': 'application/json, text/javascript',
            'Content-Type': 'application/json-patch+json'
        }

   
    };

    httpProvider.$inject = [
        '$httpProvider'
    ];

    angular.module('sc')
        .config(httpProvider);

})(window.angular);