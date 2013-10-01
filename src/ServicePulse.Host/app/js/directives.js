'use strict';

/* Directives */
angular.module('sc.directives', [])
    .directive('moment', ['$timeout', function($timeout) {
        return function(scope, element, attrs) {
            var timeoutId;

            function updateText() {
                element.text(moment(attrs.moment).fromNow());
            }

            function updateLoop() {
                timeoutId = $timeout(function() {
                    updateText();
                    updateLoop();
                }, 5000);
            }

            element.on('$destroy', function() {
                $timeout.cancel(timeoutId);
            });

            updateLoop();
        };
    }]);