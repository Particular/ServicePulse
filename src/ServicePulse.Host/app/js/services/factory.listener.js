; (function (window, angular, undefined) {
    'use strict';

    function factory($rootScope, $jquery, notifyService, toastService, $window) {

        function listener(msgUrl) {

            var subscriptions = {};
            var notifier = notifyService();

            function callSubscribers(eventName, message) {
                var anon = (function (message) {
                    this(message);
                });

                if (subscriptions.hasOwnProperty(eventName)) {
                    anon.call(subscriptions[eventName], message);
                }

                if (subscriptions.hasOwnProperty('all')) {
                    anon.call(subscriptions['all'], message);
                }

            };

            if ($jquery) {
                // you got to have jQuery for this to work
                var connection = $jquery.connection(msgUrl);

                connection.logging = true;

                connection.received(function (data) {
                    for (var i in data.types) {
                        var message = angular.extend({}, data.message);
                        message.title = data.types[i];
                        callSubscribers(data.types[i], message);
                    }
                });

                connection.start()
                    .done(function () {
                        notifier.notify('SignalREvent', 'SignalR started');

                        connection.error(function (error) {
                            notifier.notify('SignalRError', "There was a problem communicating with ServiceControl.");
                        });

                        connection.reconnected(function () {
                            notifier.notify('SignalREvent', 'Reconnected');
                        });

                        connection.stateChanged(function (change) {
                            if (change.newState === $jquery.signalR.connectionState.disconnected) {
                                notifier.notify('SignalRError', 'The server is offline');
                            }
                        });
                    })
                    .fail(function () {
                        //notification is needed for other part of Pulse that depend on the notifier to get connectivity status.
                        notifier.notify('SignalRError');
                        if ($window.location.hash.indexOf('/configuration/connections') < 0) {
                            // Uses the toastService directly to avoid breaking the notifier class. The previous notifier calls should all be removed at some point too.
                            toastService.showError('Could not connect to ServiceControl. <a class="btn btn-default" href="#/configuration/connections">View connection settings</a>', true, false);
                        }
                    });

                notifier.notify('SignalREvent', 'SignalR starting');
            }


            return {
                subscribe: function (scope, callback, eventName) {
                    if (!eventName) {
                        eventName = 'all';
                    }
                    if (!subscriptions[eventName]) {
                        subscriptions[eventName] = callback;
                    }
                    scope.$on('$destroy', function () {
                        delete subscriptions[eventName];
                    });
                }
            };
        }

        return listener;
    }

    factory.$inject = [
        '$rootScope',
        '$jquery',
        'notifyService',
        'toastService',
        '$window'
    ];

    angular.module('sc')
        .service('signalRListener', factory);

} (window, window.angular));