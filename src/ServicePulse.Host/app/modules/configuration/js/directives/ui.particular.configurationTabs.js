; (function (window, angular, $, undefined) {
    'use strict';

    angular.module('configuration', []);

    function controller($scope, $location, /*redirectService,*/ notifyService, sharedDataService) {
        var notifier = notifyService();

        $scope.isActive = (viewLocation) => viewLocation === $location.path();
        
        var stats = sharedDataService.getstats();

        $scope.counters = {
            endpoints: stats.number_of_endpoints,
            redirects: 0
        };

        //redirectService.getTotalRedirects().then((data) => {
        //    $scope.counters.redirects = data;
        //});

        notifier.subscribe($scope, (event, data) => {
            $scope.counters.redirects = data;
        }, 'RedirectMessageCountUpdated');

        notifier.subscribe($scope, (event, data) => {
            $scope.counters.endpoints = data;
        }, 'EndpointCountUpdated');
    }
    
    controller.$inject = ['$scope', '$location', /*'redirectService',*/ 'notifyService', 'sharedDataService'];

    function directive() {
        const template = require('./ui.particular.configurationTabs.tpl.html');

        return {
            scope: {},
            restrict: 'E',
            replace: true,
            template: template,
            controller: controller,
            link: function (scope, element) { }
        };
    }

    directive.$inject = [];

    angular
        .module('configuration.tabs', [])
        .directive('configurationTabs', directive);

}(window, window.angular, window.jQuery));