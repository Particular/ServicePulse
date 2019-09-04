(function (window, angular) {
    'use strict';

    function service($rootScope, $interval, notifyService, serviceControlService) {

        var endpoints = [];
        var notifier = notifyService();

        function getData() {
            serviceControlService.loadQueueNames().then(function (response) {
                notifier.notify('EndpointsUpdated', response.data);
            });
        }

        function getQueueNames() {
            return endpoints;
        }

        var endpointsUpdatedTimer = $interval(function () {
            getData();
        }, 10000);

        // Cancel interval on page changes
        $rootScope.$on('$destroy', function () {
            if (angular.isDefined(endpointsUpdatedTimer)) {
                $interval.cancel(endpointsUpdatedTimer);
                endpointsUpdatedTimer = undefined;
            }
        });

        notifier.subscribe($rootScope, function (event, data) {
            endpoints = data;
        }, 'EndpointsUpdated');

        

        function init() {
            getData();
        }

        init();

        return {
            getQueueNames: getQueueNames
        };
    }

    service.$inject = ['$rootScope', '$interval', 'notifyService', 'serviceControlService'];

    angular.module('services.endpoints', [])
        .service('endpointsService', service);

} (window, window.angular));