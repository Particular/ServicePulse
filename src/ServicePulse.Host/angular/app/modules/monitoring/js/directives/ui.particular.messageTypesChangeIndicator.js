(function (window, angular, $) {
    'use strict';

    angular.module('ui.particular.messageTypesChangeIndicator', [])
        .directive('messageTypesChangeIndicator',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        refresh: '=',
                        messageTypesAvailable: '='
                    },
                    templateUrl: 'modules/monitoring/js/directives/ui.particular.messageTypesChangeIndicator.tpl.html',
                    link: function link(scope, element, attrs) {
                        $(window).on('load scroll', function () {
                            if ($(this).scrollTop() > 510) {
                                $('.endpoint-data-changed').addClass('sticky');
                                $('.table-head-row').addClass('add-top-margin');
                            } else {
                                $('.endpoint-data-changed').removeClass('sticky');
                                $('.table-head-row').removeClass('add-top-margin');
                            }
                        });
                    }
                };
            });
}(window, window.angular, window.jQuery));