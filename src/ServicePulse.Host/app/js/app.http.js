; (function (angular) {
    'use strict';

    function httpProvider($httpProvider) {
        $httpProvider.defaults.headers.patch = {
            //'Content-Type': 'application/json;charset=utf-8'
            'Content-Type': 'application/json-patch+json'
        }
    };

    httpProvider.$inject = [
        '$httpProvider'
    ];

    angular.module('sc')
        .config(httpProvider);

})(window.angular);