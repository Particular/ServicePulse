'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
    .constant('serviceControlUrl', 'http://localhost:33333/api')
    .factory('streamService', ['$log', '$rootScope', 'serviceControlUrl', function($log, $rootScope, serviceControlUrl) {

        var connection = $.connection(serviceControlUrl + '/messagestream');

        connection.received(function(data) {
            $log.info('SignalR data received');
            $log.info(data);
            $rootScope.$broadcast(data.Type, data.Message);
        });

        connection.start().done(function() {
            $log.info('SignalR started');
        });

        var onSubscribe = function($scope, messageType, handler) {
            $scope.$on(messageType, function(event, message) {
                // note that the handler is passed the problem domain parameters 
                handler(message);
            });
        };

        var onUnsubscribe = function($scope, messageType) {

        };

        return {
            subscribe: onSubscribe,
            unsubscribe: onUnsubscribe,
            send: function(messageType, message) {
                connection.send(JSON.stringify({ message: message, type: messageType }));
            }
        };
    }])
    .service('serviceControlService', ['$http', 'serviceControlUrl', function($http, serviceControlUrl) {

        this.getEndpoints = function() {
            return $http.jsonp(serviceControlUrl + '/endpoints?callback=JSON_CALLBACK').then(function(response) {
                return response.data;
            });
        };

        this.getEndpointsWithSla = function() {
            return this
                .getEndpoints()
                .then(function(endpoints) {
                    var results = [];
                    endpoints.forEach(function(item) {
                        $http.jsonp(serviceControlUrl + '/endpoints/' + item.name + '/sla?callback=JSON_CALLBACK').then(function (response) {
                            angular.extend(item, {sla: response.data.current});
                            results.push(item);
                        });
                    });

                    return results;
                });
        };
    }]);
