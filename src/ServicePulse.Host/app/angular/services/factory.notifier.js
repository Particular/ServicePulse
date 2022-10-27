(function (window, angular) {
    'use strict';

    function factory($rootScope, $log) {

        function notifier() {
            return {
                subscribe: function (scope, callback, event) {
                    var handler = $rootScope.$on(event,
                        function (event, data) {
                            $log.debug({ 'e': event, 'd': data });
                            callback(event, data);
                        });
                    scope.$on('$destroy', handler);

                    return handler;
                },
                notify: function (event, data) {
                    $rootScope.$emit(event, data);
                }
            };
        }

        return notifier;
    }

    factory.$inject = [
        '$rootScope',
        '$log'
    ];

    angular.module('sc')
        .service('notifyService', factory);

} (window, window.angular));