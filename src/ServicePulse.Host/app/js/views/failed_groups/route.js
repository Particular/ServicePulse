﻿; (function (window, angular, undefined) {
    'use strict';

    function routeProvider($routeProvider) {
        $routeProvider.when('/failedGroups', {
            data: {
                pageTitle: 'Failed Groups'
            },
            templateUrl: '/js/views/failed_groups/view.html',
            controller: 'failedMessageGroupsController',
            controllerAs: 'vm'
        });
    };

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));