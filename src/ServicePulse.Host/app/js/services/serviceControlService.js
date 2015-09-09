(function() {
    'use strict';

    angular.module('services.serviceControlService', [])
        .service('serviceControlService', [
            '$http', 'scConfig', 'notifications', function ($http, scConfig, notifications) {

                this.getVersion = function() {
                    return $http.get(scConfig.service_control_url).then(function(response) {
                        return response.headers('X-Particular-Version');
                    });
                };

                this.checkLicense = function () {
                    return $http.get(scConfig.service_control_url + '/').then(function (response) {
                        if (response.data.license_status != "valid") {
                            return false;
                        }
                        return true;
                    });
                };

                this.getEventLogItems = function() {
                    return $http.get(scConfig.service_control_url + '/eventlogitems').then(function(response) {
                        return response.data;
                    });
                };

                this.getFailedMessages = function(sortBy, page) {
                    return $http.get(scConfig.service_control_url + '/errors?status=unresolved&page=' + page + '&sort=' + sortBy).then(function(response) {
                        return {
                            data: response.data,
                            total: response.headers('Total-Count')
                        };
                    });
                };

                this.getExceptionGroups = function () {
                    return $http.get(scConfig.service_control_url + '/recoverability/groups').then(function (response) {
                        return {
                            data: response.data
                        };
                    });
                };

                this.getFailedMessagesForExceptionGroup = function (groupId, sortBy, page) {
                    return $http.get(scConfig.service_control_url + '/recoverability/groups/' + groupId + '/errors?page=' + page + '&sort=' + sortBy).then(function (response) {
                        return {
                            data: response.data,
                            total: response.headers('Total-Count')
                        };
                    });
                };

                this.getMessageBody = function(messageId) {
                    return $http.get(scConfig.service_control_url + '/messages/' + messageId + "/body").then(function(response) {
                        return {
                            data: response.data
                        };
                    });
                };

                this.getMessageHeaders = function(messageId) {
                    return $http.get(scConfig.service_control_url + '/messages/search/' + messageId).then(function (response) {
                        return {
                            data: response.data
                        };
                    });
                };

                this.getTotalFailedMessages = function() {
                    return $http.head(scConfig.service_control_url + '/errors?status=unresolved').then(function(response) {
                        return response.headers('Total-Count');
                    });
                };

                this.getTotalFailingCustomChecks = function() {
                    return $http.head(scConfig.service_control_url + '/customchecks?status=fail').then(function(response) {
                        return response.headers('Total-Count');
                    });
                };

                this.getFailingCustomChecks = function(page) {
                    return $http.get(scConfig.service_control_url + '/customchecks?status=fail&page=' + page).then(function(response) {
                        return {
                            data: response.data,
                            total: response.headers('Total-Count')
                        };
                    });
                };

                this.getFailedMessageStats = function() {
                    return $http.get(scConfig.service_control_url + '/errors/summary').then(function(response) {
                        return response.data;
                    });
                };

                this.muteCustomChecks = function(customCheck) {
                    $http.delete(scConfig.service_control_url + '/customchecks/' + customCheck.id)
                        .success(function() {
                            notifications.pushForCurrentRoute('"{{item.custom_check_id}}" custom check muted', 'info', { item: customCheck });
                        })
                        .error(function() {
                            notifications.pushForCurrentRoute('Failed to mute "{{item.custom_check_id}}" custom check', 'error', { item: customCheck });
                        });
                };

                this.retryAllFailedMessages = function() {
                    $http.post(scConfig.service_control_url + '/errors/retry/all')
                        .success(function() {
                            notifications.pushForCurrentRoute('Retrying all messages...', 'info');
                        })
                        .error(function() {
                            notifications.pushForCurrentRoute('Retrying all messages failed', 'error');
                        });
                };

                this.retryFailedMessages = function(selectedMessages) {
                    $http.post(scConfig.service_control_url + '/errors/retry', selectedMessages)
                        .success(function() {
                            notifications.pushForCurrentRoute('Retrying {{num}} messages...', 'info', { num: selectedMessages.length });
                        })
                        .error(function() {
                            notifications.pushForCurrentRoute('Retrying messages failed', 'error');
                        });
                };
            
                this.archiveFailedMessages = function(selectedMessages) {
                    $http({
                            url: scConfig.service_control_url + '/errors/archive',
                            data: selectedMessages,
                            method: "PATCH",
                        })
                        .success(function() {
                            notifications.pushForCurrentRoute('Archiving {{num}} messages...', 'info', { num: selectedMessages.length });
                        })
                        .error(function() {
                            notifications.pushForCurrentRoute('Archiving messages failed', 'error');
                        });
                };

                this.archiveExceptionGroup = function (id, successText) {
                    $http.post(scConfig.service_control_url + '/recoverability/groups/' + id + '/errors/archive')
                       .success(function () {
                           notifications.pushForCurrentRoute(successText, 'info');
                       })
                       .error(function () {
                           notifications.pushForCurrentRoute('Archiving messages failed', 'error');
                       });
                };

                this.retryExceptionGroup = function (id, successText) {
                    $http.post(scConfig.service_control_url + '/recoverability/groups/' + id + '/errors/retry')
                       .success(function () {
                           notifications.pushForCurrentRoute(successText, 'info');
                       })
                       .error(function () {
                           notifications.pushForCurrentRoute('Retrying messages failed', 'error');
                       });
                };

                this.getHeartbeatStats = function() {
                    return $http.get(scConfig.service_control_url + '/heartbeats/stats').then(function(response) {
                        return response.data;
                    });
                };

                this.removeEndpoint = function(endpoint) {
                    $http.delete(scConfig.service_control_url + '/heartbeats/' + endpoint.id)
                        .success(function() {
                            notifications.pushForCurrentRoute('{{item.originating_endpoint.name}}@{{item.originating_endpoint.machine}} endpoint removed', 'info', { item: endpoint });
                        })
                        .error(function() {
                            notifications.pushForCurrentRoute('Failed to remove {{item.originating_endpoint.name}}@{{item.originating_endpoint.machine}} endpoint', 'error', { item: endpoint });
                        });
                };

                this.updateEndpoint = function(id, data) {
                    return $http({
                            url: scConfig.service_control_url + '/endpoints/' + id,
                            data: data,
                            method: "PATCH",
                        })
                        .success(function() {
                            notifications.pushForCurrentRoute('Endpoint updated', 'info');
                        })
                        .error(function() {
                            notifications.pushForCurrentRoute('Failed to update endpoint', 'error');
                        });
                };

                this.getEndpoints = function() {
                    return $http.get(scConfig.service_control_url + '/endpoints').then(function(response) {
                        return response.data;
                    });
                };

                this.getEndpointsWithSla = function() {
                    return this
                        .getEndpoints()
                        .then(function(endpoints) {
                            var results = [];
                            endpoints.forEach(function(item) {
                                $http.get(scConfig.service_control_url + '/endpoints/' + item.name + '/sla').then(function(response) {
                                    angular.extend(item, { sla: response.data.current });
                                    results.push(item);
                                });
                            });

                            return results;
                        });
                };
            }
        ]);

})();