(function (angular) {
    'use strict';

    function logProvider($logProvider) {
        $logProvider.debugEnabled(true);
    }

    logProvider.$inject = [
        '$logProvider'
    ];

    angular.module('sc')
        .config(logProvider);

})(window.angular);