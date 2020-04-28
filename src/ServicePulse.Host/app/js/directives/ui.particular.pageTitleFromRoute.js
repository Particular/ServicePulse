(function (window, angular) {
    'use strict';

    function directive($route, $rootScope, $window) {
        return {
            scope: {
            },
            restrict: 'E',
            replace: true,
            link: function (scope, element) {
                $rootScope.$on('$routeChangeSuccess', function() {
                    $window.document.title = $route.current.$$route.data.pageTitle + ' • ServicePulse';
                });
             }
        };
    }
    
    directive.$inject = ['$route', '$rootScope', '$window'];
    
    angular.module('ui.particular.pageTitleFromRoute', ['ngRoute'])
        .directive('pageTitleFromRoute', directive);

}(window, window.angular));
