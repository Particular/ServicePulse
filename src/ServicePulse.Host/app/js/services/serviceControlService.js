'use strict';

angular.module('services.serviceControlService', [])
    .service('serviceControlService', ['$http', 'scConfig', function ($http, scConfig) {

        this.getAlerts = function () {
            return $http.get(scConfig.service_control_url + '/alerts').then(function (response) {
                return response.data;
            });
        };
        
        this.getFailedMessages = function () {
            return $http.get(scConfig.service_control_url + '/errors').then(function (response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        };
        
        this.getTotalFailedMessages = function () {
            return $http.head(scConfig.service_control_url + '/errors').then(function (response) {
                return response.headers('Total-Count');
            });
        };
          
        this.getFailedMessageStats = function () {
            return $http.get(scConfig.service_control_url + '/errors/facets').then(function (response) {
                return response.data;
            });
        };

        this.retryAllFailedMessages = function () {
            $http.post(scConfig.service_control_url + '/errors/retry/all')
                .success(function() {
                    alert('successfully posted');
                });
        };
        
        this.retrySelectedFailedMessages = function (selectedMessages) {
            $http.post(scConfig.service_control_url + '/errors/retry', selectedMessages)
                .success(function () {
                    alert('successfully posted');
                });
        };

        this.getHeartbeatStats = function () {
            return $http.get(scConfig.service_control_url + '/heartbeats/stats').then(function (response) {
                return response.data;
            });
        };
        
        this.getHeartbeatsList = function () {
            return $http.get(scConfig.service_control_url + '/heartbeats').then(function (response) {
                return response.data;
            });
        };
        
        this.getEndpoints = function() {
            return $http.get(scConfig.service_control_url + '/endpoints').then(function (response) {
                return response.data;
            });
        };

        this.getEndpointsWithSla = function() {
            return this
                .getEndpoints()
                .then(function(endpoints) {
                    var results = [];
                    endpoints.forEach(function(item) {
                        $http.get(scConfig.service_control_url + '/endpoints/' + item.name + '/sla').then(function (response) {
                            angular.extend(item, {sla: response.data.current});
                            results.push(item);
                        });
                    });

                    return results;
                });
        };
    }]);
