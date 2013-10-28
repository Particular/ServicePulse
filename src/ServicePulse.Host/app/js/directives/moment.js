'use strict';

angular.module('directives.moment', [])
    .directive('spMoment', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            link: function(scope, element, attrs) {
                var timeoutId = null;
                var m;
                
                attrs.$observe('date', function (value) {
                    if (value) {
                        m = moment(attrs.date);
                        element.attr('title', m.format('LLLL'));
                        updateText();
                        updateLoop();
                    }
                });

                function updateText() {
                    element.text(m.fromNow());
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