; (function (window, angular, undefined) {
    'use strict';

    require('angular');

    function directive() {
        const template = require('./platformExpired.html');

        return {
            scope: {
            },
            restrict: 'E',
            replace: true,
            template: template,
            link: function (scope, element) {
            }
        };
    }

    directive.$inject = [];

    angular.module('licenseNotifierService', [])
        .directive('platformTrialExpired', directive);
} (window, window.angular));