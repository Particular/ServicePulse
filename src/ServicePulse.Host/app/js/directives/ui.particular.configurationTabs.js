
; (function (window, angular, $, undefined) {
    'use strict';


    function controller($scope, $interval, $location, redirectService, notifyService, sharedDataService) {
        var notifier = notifyService();

        $scope.isActive = function (viewLocation) {
            var active = (viewLocation === $location.path());
            return active;
        };
        
        var stats = sharedDataService.getstats();

        redirectService.getTotalRedirects().then(function(response) {
            $scope.counters.redirects = response || 0;
        });

        $scope.counters = {
            endpoints: stats.number_of_endpoints,
            redirects: 0
        }

        var redirectPromise = $interval(function () {
            redirectService.getTotalRedirects().then(function (response) {
                notifier.notify('RedirectMessageCountUpdated', response || 0);
            });
        }, 10000);

        // Cancel interval on page changes
        $scope.$on('$destroy', function () {
            if (angular.isDefined(redirectPromise)) {
                $interval.cancel(redirectPromise);
                redirectPromise = undefined;
            }
        });


        notifier.subscribe($scope, function (event, data) {
            $scope.counters.redirects = data;
        }, 'RedirectMessageCountUpdated');

        notifier.subscribe($scope, function (event, data) {
            $scope.counters.endpoints = data;
        }, 'EndpointCountUpdated');
        
    }
    
    controller.$inject = ['$scope', '$interval', '$location', 'redirectService', 'notifyService', 'sharedDataService'];

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

