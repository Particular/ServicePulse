(function (window, angular, $) {
    'use strict';

    function Directive() {

        return function (scope, element) {
            $(element).click(function (event) {
                event.preventDefault();
                event.stopPropagation();
            });
        };
    }

    angular
        .module('ui.particular.eatClick', [])
        .directive('eatClick', Directive);

}(window, window.angular, window.jQuery));

(function (window, angular, $) {
    'use strict';

    function directive() {

        return {
            link: function (scope, elem) {
                elem.on('click', function (e) {
                    e.stopPropagation();
                });
            }
        };
    }

    angular
        .module('ui.particular.isolateClick', [])
        .directive('isolateClick', directive);

}(window, window.angular, window.jQuery));

