(function (window, angular) {
    'use strict';

    var cachedEditAndRetryConfig = undefined;

    function routeProvider($routeProvider) {
        $routeProvider.when('/message/:messageId', {
            redirectTo: '/failed-messages/message/:messageId'
        }).when('/failed-messages/message/:messageId', {
            data: {
                pageTitle: 'Message'
            },
            templateUrl: 'js/views/message/messages-view.html',
            controller: 'messagesController',
            controllerAs: 'vm',
            resolve: {
                editAndRetryConfig: ['serviceControlService', function(serviceControlService) {
                    if (!cachedEditAndRetryConfig) {
                        return serviceControlService.getEditAndRetryConfig()
                            .then(function(config) {
                                cachedEditAndRetryConfig = config;
                                return config;
                            });
                    } else {
                        return cachedEditAndRetryConfig;
                    }
                }]
            }
        });
    }

    routeProvider.$inject = [
        '$routeProvider'
    ];

    angular.module('sc')
        .config(routeProvider);

}(window, window.angular));
