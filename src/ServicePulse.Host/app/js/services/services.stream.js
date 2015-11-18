; (function (window, angular, undefined) {
    'use strict';

    function Service(notifications, $log, $rootScope, scConfig, $jquery, uri) {

        var subscriberRegistry = {}, registryKey = 1;

        var url = uri.join(scConfig.service_control_url, 'messagestream');

        var connection = $jquery.connection(url);

        connection.logging = true;

        connection.received(function (data) {
            for (var i in data.types) {
                callSubscribers(data.types[i], data.message);
            }
        });

        connection
            .start()
            .done(function () {

                $log.info('SignalR started');

                connection.error(function (error) {
                    notifications.pushForCurrentRoute('Lost connection to ServiceControl! Error: {{error}}', 'danger', { error: error });
                });

                connection.reconnected(function () {
                    notifications.pushForCurrentRoute('Reconnected to ServiceControl', 'info');
                });

                connection.stateChanged(function (change) {
                    console.log('SignalR state changed to=' + change.newState);

                    if (change.newState === $jquery.signalR.connectionState.disconnected) {
                        console.log('The server is offline');
                    }
                });

            })
            .fail(function () {
                notifications.pushForCurrentRoute('Can\'t connect to ServiceControl ({{url}})', 'danger', { url: scConfig.service_control_url });
            });

        function callSubscribers(messageType, message) {
            if (!subscriberRegistry[messageType]) {
                return;
            }

            var subscriberDictionary = subscriberRegistry[messageType];

            for (var key in subscriberDictionary) {
                if (subscriberDictionary.hasOwnProperty(key)) {
                    if ($jquery.isFunction(subscriberDictionary[key])) {
                        subscriberDictionary[key].call(undefined, message);
                    }
                }
            }
        };

        function onSubscribe(messageType, handler) {
            if (!subscriberRegistry[messageType]) {
                subscriberRegistry[messageType] = {};
            }

            var uniqueKey = registryKey++;

            subscriberRegistry[messageType][uniqueKey] = function (message) {
                handler(message);
            };

            var unsubscribeAction = function() {
                delete subscriberRegistry[messageType][uniqueKey];
            };

            return unsubscribeAction;
        };

        return {
            subscribe: onSubscribe,
            send: function (messageType, message) {
                connection.send(JSON.stringify({ message: message, type: messageType }));
            }
        };
    };

    Service.$inject = ['notifications', '$log', '$rootScope', 'scConfig', '$jquery', 'uri'];

    angular
        .module('services.streamService', [])
        .factory('streamService', Service);


}(window, window.angular));