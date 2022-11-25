(function (window, angular) {
    'use strict';

angular.module('services.exceptionHandler', ['services.notifications']);

angular.module('services.exceptionHandler').factory('exceptionHandlerFactory', ['$injector', function ($injector) {
    return function ($delegate) {

        return function (exception, cause) {
            // Lazy load notifications to get around circular dependency
            // Circular dependency: $rootScope <- notifications <- $exceptionHandler
            var notifications = $injector.get('notifications');

            // Pass through to original handler
            $delegate(exception, cause);

            // Push a notification error
            notifications.pushForCurrentRoute('error.fatal', 'danger', {}, {
                exception: exception,
                cause: cause
            });
        };
    };
}]);

angular.module('services.exceptionHandler').config(['$provide', function ($provide) {
    $provide.decorator('$exceptionHandler', ['$delegate', 'exceptionHandlerFactory', function ($delegate, exceptionHandlerFactory) {
        return exceptionHandlerFactory($delegate);
    }]);
}]);

}(window, window.angular, window.Rx));