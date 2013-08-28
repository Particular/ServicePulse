'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
    .constant('serviceControlUrl', 'http://localhost:33333/api')
    .factory('streamService', ['$log', '$rootScope', 'serviceControlUrl', function ($log, $rootScope, serviceControlUrl) {

        var connection = $.connection(serviceControlUrl + '/messagestream');

        connection.received(function (data) {
            $log.info('SignalR data received');
            $log.info(data);
            $rootScope.$broadcast(data.messageType, data.message);
        });
        
        connection.start().done(function () {
            $log.info('SignalR started');
        });
        
        var onSubscribe = function ($scope, messageType, handler) {
            $scope.$on(messageType, function (event, message) {
                // note that the handler is passed the problem domain parameters 
                handler(message);
            });
        };
        
        var onUnsubscribe = function ($scope, messageType) {
           
        };

        return {
            subscribe: onSubscribe,
            unsubscribe: onUnsubscribe,
            send: function(messageType, message) {
                connection.send(JSON.stringify({ message: message, messageType: messageType }));
            }
        };
    }]);
