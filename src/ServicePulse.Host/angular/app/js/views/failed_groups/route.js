(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/failedGroups', {
            redirectTo: '/failed-messages/groups'
        }).when('/failed-messages/groups', {
            data: {
                pageTitle: 'Failed Groups'
            },
            templateUrl: 'js/views/failed_groups/failed-groups-view.html',
            controller: 'failedMessageGroupsController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));