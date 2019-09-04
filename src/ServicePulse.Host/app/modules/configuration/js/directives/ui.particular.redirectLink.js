(function (window, angular) {
    'use strict';

    function controller($scope, redirectModalService) {
        $scope.editRedirect = () => redirectModalService.displayEditRedirectModal($scope.redirect);
        $scope.createRedirect = () => redirectModalService.displayCreateRedirectModal($scope.queue_address);
    }
    
    controller.$inject = ['$scope', 'redirectModalService'];

    function directive() {
        const template = require('./ui.particular.redirectLink.tpl.html');

        return {
            scope: { redirect: '=redirect', queue_address: '@queueAddress' },
            restrict: 'E',
            replace: true,
            template: template,
            controller: controller,
            link: function (scope, element) { }
        };
    }

    directive.$inject = [];

    angular
        .module('configuration.redirect', [])
        .directive('redirectLink', directive);

}(window, window.angular, window.jQuery));