(function (window, angular) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/archivedgroups', {
            redirectTo: '/archivedgroups/groups'
        }).when('/archivedgroups/groups', {
            data: {
                pageTitle: 'Deleted message groups'
            },
            templateUrl: 'js/views/archivedgroups/archivedgroups.html',
            controller: 'archivedMessageGroupsController',
            controllerAs: 'vm'
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));
