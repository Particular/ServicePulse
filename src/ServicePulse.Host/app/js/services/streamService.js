'use strict';

angular.module('services.streamService', [])
    .factory('streamService', ['$log', '$rootScope', 'scConfig', function($log, $rootScope, scConfig) {
        var prefix = 'signalr::';
        var connection = $.connection(scConfig.service_control_url + '/messagestream');
        var registrations = {};

        connection.received(function(data) {
            $log.info('SignalR data received');
            $log.info(data);
            $rootScope.$broadcast(prefix + data.type, data.message);
        });

        connection.start().done(function() {
            $log.info('SignalR started');
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