
; (function (window, angular, undefined) {
    'use strict';


    function controller($scope, redirectModalService) {

        $scope.editRedirect = function() {
            redirectModalService.displayEditRedirectModal($scope.redirect);
        };

        $scope.createRedirect = function() {
            redirectModalService.displayCreateRedirectModal($scope.queue_address);
        };
    }
    
    controller.$inject = ['$scope', 'redirectModalService'];

    function directive() {
        return {
            scope: { redirect: '=redirect', queue_address: '@queueAddress' },
            restrict: 'E',
            replace: true,
            templateUrl: 'js/directives/ui.particular.redirectLink.tpl.html',
            controller: controller,
            link: function (scope, element) { }
        };
    }

    directive.$inject = [];

    angular
        .module('ui.particular.redirectLink', [])
        .directive('redirectLink', directive);

}(window, window.angular, window.jQuery));

