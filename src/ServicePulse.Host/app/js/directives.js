'use strict';

/* Directives */
angular.module('sc.directives', [])
    .directive('moment', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            link: function(scope, element, attrs) {
                var timeoutId = null;

                attrs.$observe('date', function (value) {
                    if (value) {
                        updateText();
                        updateLoop();
                    }
                });

                function updateText() {
                    element.text(moment(attrs.date).fromNow());
                }

                function updateLoop() {
                    timeoutId = $timeout(function() {
                        updateText();
                        updateLoop();
                    }, 5000);
                }

                element.on('$destroy', function() {
                    if (timeoutId == null) {
                        return;
                    }

                    $timeout.cancel(timeoutId);
                });
            }
        };
    }]);