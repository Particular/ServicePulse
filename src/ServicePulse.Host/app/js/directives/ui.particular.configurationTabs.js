
; (function (window, angular, $, undefined) {
    'use strict';


    function controller($scope, $interval, $location) {
        
        $scope.isActive = function (viewLocation) {
            var active = (viewLocation === $location.path());
            return active;
        };

        $scope.counters = {
            endpoints: 0,
            redirects: 0
        }
        
    }
    
    controller.$inject = ['$scope', '$interval', '$location'];

    function directive() {
        return {
            scope: {},
            restrict: 'E',
            replace: true,
            templateUrl: 'js/directives/ui.particular.configurationTabs.tpl.html',
            controller: controller,
            link: function (scope, element) { }
        };
    };

    directive.$inject = [];

    angular
        .module('ui.particular.configurationTabs', [])
        .directive('configurationTabs', directive);

}(window, window.angular, window.jQuery));

