
; (function (window, angular, $, undefined) {
    'use strict';


    function controller($scope, $location, redirectService, notifyService, sharedDataService) {
        var notifier = notifyService();

        $scope.isActive = function (viewLocation) {
            return (viewLocation === $location.path());
        };
        
        var stats = sharedDataService.getstats();

        $scope.counters = {
            endpoints: stats.number_of_endpoints,
            redirects: 0
        };

        redirectService.getTotalRedirects().then(function(data) {
            $scope.counters.redirects = data;
        });

        notifier.subscribe($scope, function (event, data) {
            $scope.counters.redirects = data;
        }, 'RedirectMessageCountUpdated');

        notifier.subscribe($scope, function (event, data) {
            $scope.counters.endpoints = data;
        }, 'EndpointCountUpdated');
        
    }
    
    controller.$inject = ['$scope', '$location', 'redirectService', 'notifyService', 'sharedDataService'];

    function directive() {
        return {
            scope: {},
            restrict: 'E',
            replace: true,
            templateUrl: 'js/directives/ui.particular.configurationTabs.tpl.html',
            controller: controller,
            link: function (scope, element) { }
        };
    }

    directive.$inject = [];

    angular
        .module('ui.particular.configurationTabs', [])
        .directive('configurationTabs', directive);

}(window, window.angular, window.jQuery));

