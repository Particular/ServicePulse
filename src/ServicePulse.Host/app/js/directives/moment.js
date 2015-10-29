;
(function(window, angular, undefined) {
    'use strict';

    function Directive($timeout) {
        return {
            restrict: 'E',
            link: function(scope, element, attrs) {
                var minDate = '0001-01-01T00:00:00';
                var timeoutId = null;
                var m;

                function updateText() {
                    element.text(m.fromNow());
                }

                function updateLoop() {
                    timeoutId = $timeout(function() {
                        updateText();
                        updateLoop();
                    }, 5000);
                }

                attrs.$observe('date', function(value) {
                    if (value && attrs.date !== minDate) {
                        m = moment(attrs.date);
                        element.attr('title', m.format('LLLL'));
                        updateText();
                        updateLoop();
                    } else {
                        element.text('TimeSent value unknown');
                    }
                });

                element.on('$destroy', function() {
                    if (timeoutId == null) {
                        return;
                    }

                    $timeout.cancel(timeoutId);
                });
            }
        };
    }

    Directive.$inject = ['$timeout'];

    angular.module('directives.moment', [])
        .directive('spMoment', Directive);

}(window, window.angular));