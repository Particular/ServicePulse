; (function (window, angular, $, undefined) {
    'use strict';

    angular.module('services.uri', [])
        .service('uri', function () {

            this.join = function( /* path segments */) {
                // Split the inputs into a list of path commands.
                var parts = [];
                for (var i = 0; i < arguments.length; i++) {
                    parts = parts.concat(('' + arguments[i]).replace(/\/$/, ''));
                }

                // Turn back into a single string path.
                return parts.join('/');
            };
        });

} (window, window.angular, window.jQuery));