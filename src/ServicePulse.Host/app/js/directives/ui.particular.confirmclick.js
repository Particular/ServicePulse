(function() {
    'use strict';

    angular
        .module('ui.particular.confirmClick',[])
        .directive('confirmClick', function confirmClick() {

            function link(scope, element, attrs) {
                element.bind('click', function (e) {
                    var message = attrs.confirmClick;
                    if (message && !confirm(message)) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                });
            }

            var directive = {
                priority: -1,
                link: link,
                restrict: 'EA'
            };

            return directive;
        });
})();