'use strict';

angular.module('services.streamService', [])
    .factory('streamService', ['notifications', '$log', '$rootScope', 'scConfig', function(notifications, $log, $rootScope, scConfig) {
        var prefix = 'signalr::';
        var connection = $.connection(scConfig.service_control_url + '/messagestream');
        var registrations = {};

        connection.received(function(data) {
            $log.info('SignalR data received');
            $log.info(data);
            $rootScope.$broadcast(prefix + data.type, data.message);
        });

        connection.start()
            .done(function() {
                $log.info('SignalR started');

                connection.error(function(error) {
                    notifications.pushForCurrentRoute('Lost connection to ServiceControl! Error: {{error}}', 'error', { error: error });
                });

                connection.reconnected(function() {
                    notifications.pushForCurrentRoute('Reconnected to ServiceControl', 'info');
                });

                connection.stateChanged(function(change) {
                    console.log('SignalR state changed to=' + change.newState);

                    if (change.newState === $.signalR.connectionState.disconnected) {
                        console.log('The server is offline');
                    }
                });
            }).fail(function() {
                notifications.pushForCurrentRoute('Can\'t connect to ServiceControl ({{url}})', 'error', { url: scConfig.service_control_url });
            });

        var onSubscribe = function($scope, messageType, handler) {
            var deregFunc = $scope.$on(prefix + messageType, function(event, message) {
                $scope.$apply(function() {
                    handler(message);
                });
            });

            registrations[messageType + $scope.$id] = deregFunc;
        };

        var onUnsubscribe = function($scope, messageType) {
            var deregFunc = registrations[messageType + $scope.$id];

            if (deregFunc !== null) {
                deregFunc();
            }

            delete registrations[messageType + $scope.$id];
        };

        return {
            subscribe: onSubscribe,
            unsubscribe: onUnsubscribe,
            send: function(messageType, message) {
                connection.send(JSON.stringify({ message: message, type: messageType }));
            }
        };
    }]);