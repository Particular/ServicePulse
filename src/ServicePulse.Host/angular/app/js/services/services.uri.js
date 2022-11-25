(function (window, angular, $) {
    'use strict';

    angular.module('services.uri', [])
        .service('uri', function () {

            this.join = function (/* path segments */) {

                // Split the inputs into a list of path commands.
                var parts = [];
                for (var i = 0; i < arguments.length; i++) {

                    var partWithoutOuterSlashes =
                        ('' + arguments[i]) // coerce to string
                          .replace(/^\//, '') //replace leading slash
                          .replace(/\/$/, ''); //replace trailing slash

                    parts = parts.concat(partWithoutOuterSlashes);
                }

                // Turn back into a single string path.
                return parts.join('/');
            };
        });

} (window, window.angular, window.jQuery));