'use strict';

angular.module('services.serviceControlService', [])
    .service('serviceControlService', ['$http', 'scConfig', 'notifications', function ($http, scConfig, notifications) {

        this.getEventLogItems = function () {
            return $http.get(scConfig.service_control_url + '/eventlogitems').then(function (response) {
                return response.data;
            });
        };
        
        this.getFailedMessages = function(sortBy, page) {
            return $http.get(scConfig.service_control_url + '/errors?status=unresolved&page=' + page + '&sort=' + sortBy).then(function (response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        };
        
        this.getTotalFailedMessages = function () {
            return $http.head(scConfig.service_control_url + '/errors?status=unresolved').then(function (response) {
                return response.headers('Total-Count');
            });
        };
        
        this.getTotalCustomChecks = function () {
            return $http.head(scConfig.service_control_url + '/customchecks').then(function (response) {
                return response.headers('Total-Count');
            });
        };
        
        this.getCustomChecks = function (page) {
            return $http.get(scConfig.service_control_url + '/customchecks?page=' + page).then(function (response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        };
          
        this.getFailedMessageStats = function () {
            return $http.get(scConfig.service_control_url + '/errors/summary').then(function (response) {
                return response.data;
            });
        };

        this.muteCustomChecks = function(customCheck) {
            $http.delete(scConfig.service_control_url + '/customchecks/' + customCheck.id)
                .success(function () {
                    notifications.pushForCurrentRoute('"{{item.custom_check_id}}" custom check muted', 'info', { item: customCheck });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Failed to mute "{{item.custom_check_id}}" custom check', 'error', { item: customCheck });
                });
        };
        
        this.retryAllFailedMessages = function () {
            $http.post(scConfig.service_control_url + '/errors/retry/all')
                .success(function () {
                    notifications.pushForCurrentRoute('Retrying all messages...', 'info');
                })
                .error(function() {
                    notifications.pushForCurrentRoute('Retrying all messages failed', 'error');
                });
        };
        
        this.retryFailedMessages = function (selectedMessages) {
            $http.post(scConfig.service_control_url + '/errors/retry', selectedMessages)
                .success(function () {
                    notifications.pushForCurrentRoute('Retrying {{num}} messages...', 'info', { num: selectedMessages.length });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Retrying messages failed', 'error');
                });
        };

        this.archiveFailedMessages = function (selectedMessages) {
            $http.post(scConfig.service_control_url + '/errors/archive', selectedMessages)
                .success(function () {
                    notifications.pushForCurrentRoute('Archiving {{num}} messages...', 'info', { num: selectedMessages.length });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Archiving messages failed', 'error');
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
        
        this.removeEndpoint = function (endpoint) {
            $http.delete(scConfig.service_control_url + '/heartbeats/' + endpoint.id)
                .success(function () {
                    notifications.pushForCurrentRoute('{{item.originating_endpoint.name}}@{{item.originating_endpoint.machine}} endpoint removed', 'info', { item: endpoint });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Failed to remove {{item.originating_endpoint.name}}@{{item.originating_endpoint.machine}} endpoint', 'error', { item: endpoint });
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
                            angular.extend(item, { sla: response.data.current });
                            results.push(item);
                        });
                    });

                    return results;
                });
        };
    }]);
