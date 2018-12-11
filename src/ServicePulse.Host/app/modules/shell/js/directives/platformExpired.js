; (function (window, angular, undefined) {
    'use strict';

    angular.module('platformexpired', []);

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

    function trialExpiredDirective() {
        const template = require('./platformTrialExpired.html');

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
    
    angular.module('platformexpired').directive('platformTrialExpired', trialExpiredDirective);
    angular.module('platformexpired').directive('platformExpired', directive);
} (window, window.angular));