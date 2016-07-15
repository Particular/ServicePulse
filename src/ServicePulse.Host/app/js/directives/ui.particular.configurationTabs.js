
; (function (window, angular, $, undefined) {
    'use strict';


    function controller($scope, $interval, $location, redirectService, notifyService, sharedDataService) {
        var notifier = notifyService();

        $scope.isActive = function (viewLocation) {
            return (viewLocation === $location.path());
        };
        
        var stats = sharedDataService.getstats();

        redirectService.getTotalRedirects().then(function(response) {
            $scope.counters.redirects = response || 0;
        });

        $scope.counters = {
            endpoints: stats.number_of_endpoints,
            redirects: 0
        };

        var redirectUpdatedTimer = $interval(function () {
            redirectService.getTotalRedirects().then(function (response) {
                notifier.notify('RedirectMessageCountUpdated', response || 0);
            });
        }, 10000);

        // Cancel interval on page changes
        $scope.$on('$destroy', function () {
            if (angular.isDefined(redirectUpdatedTimer)) {
                $interval.cancel(redirectUpdatedTimer);
                redirectUpdatedTimer = undefined;
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
    }

    directive.$inject = [];

    angular
        .module('ui.particular.configurationTabs', [])
        .directive('configurationTabs', directive);

}(window, window.angular, window.jQuery));

