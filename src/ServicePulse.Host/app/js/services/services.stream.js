; (function (window, angular, $, undefined) {
    'use strict';

    function Service(notifications, $log, $rootScope, scConfig) {
        var prefix = 'signalr::';

        var registrations = {};

        var connection = $.connection(scConfig.service_control_url + '/messagestream');

        connection.received(function (data) {

            for (var i in data.types) {
                var type = data.types[i];
                $rootScope.$broadcast(prefix + type, data.message);
            }

        });

        connection
            .start()
            .done(function () {

                $log.info('SignalR started');

                connection.error(function (error) {
                    notifications.pushForCurrentRoute('Lost connection to ServiceControl! Error: {{error}}', 'error', { error: error });
                });

                connection.reconnected(function () {
                    notifications.pushForCurrentRoute('Reconnected to ServiceControl', 'info');
                });

                connection.stateChanged(function (change) {
                    console.log('SignalR state changed to=' + change.newState);

                    if (change.newState === $.signalR.connectionState.disconnected) {
                        console.log('The server is offline');
                    }
                });

            })
            .fail(function () {
                notifications.pushForCurrentRoute('Can\'t connect to ServiceControl ({{url}})', 'error', { url: scConfig.service_control_url });
            });

        function onSubscribe($scope, messageType, handler) {
            var deregFunc = $scope.$on(prefix + messageType, function (event, message) {
                $scope.$apply(function () {
                    handler(message);
                });
            });

            registrations[messageType + $scope.$id] = deregFunc;
        };

        function onUnsubscribe($scope, messageType) {
            var deregFunc = registrations[messageType + $scope.$id];

            if (deregFunc !== null) {
                deregFunc();
            }

            delete registrations[messageType + $scope.$id];
        };

        return {
            subscribe: onSubscribe,
            unsubscribe: onUnsubscribe,
            send: function (messageType, message) {
                connection.send(JSON.stringify({ message: message, type: messageType }));
            }
        };
    };

    Service.$inject = ['notifications', '$log', '$rootScope', 'scConfig'];

    angular
        .module('services.streamService', [])
        .factory('streamService', Service);


} (window, window.angular, window.jQuery));