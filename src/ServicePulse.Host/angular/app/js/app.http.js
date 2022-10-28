(function (angular) {
    'use strict';

    function httpProvider($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
    }

    httpProvider.$inject = [
        '$httpProvider'
    ];

    angular.module('sc')
        .config(httpProvider);

})(window.angular);