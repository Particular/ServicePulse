; (function (window, angular, $, undefined) {
    'use strict';


    function Service($http, scConfig, notifications) {

        function getVersion() {
            return $http.get(scConfig.service_control_url).then(function (response) {
                return response.headers('X-Particular-Version');
            });
        };
        
        function checkLicense() {
            return $http.get(scConfig.service_control_url + '/').then(function (response) {
                if (response.data.license_status != "valid") {
                    return false;
                }
                return true;
            });
        };

        function getEventLogItems() {
            return $http.get(scConfig.service_control_url + '/eventlogitems').then(function (response) {
                return response.data;
            });
        };

        function getFailedMessages(sortBy, page) {
            return $http.get(scConfig.service_control_url + '/errors?status=unresolved&page=' + page + '&sort=' + sortBy).then(function (response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        };

        function getExceptionGroups() {
            return $http.get(scConfig.service_control_url + '/recoverability/groups').then(function (response) {
                return {
                    data: response.data
                };
            });
        };

        function getFailedMessagesForExceptionGroup(groupId, sortBy, page) {
            return $http.get(scConfig.service_control_url + '/recoverability/groups/' + groupId + '/errors?page=' + page + '&sort=' + sortBy).then(function (response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        };

        function getMessageBody(messageId) {
            return $http.get(scConfig.service_control_url + '/messages/' + messageId + "/body").then(function (response) {
                return {
                    data: response.data
                };
            });
        };

        function getMessageHeaders(messageId) {
            return $http.get(scConfig.service_control_url + '/messages/search/' + messageId).then(function (response) {
                return {
                    data: response.data
                };
            });
        };

        function getTotalFailedMessages() {
            return $http.head(scConfig.service_control_url + '/errors?status=unresolved').then(function (response) {
                return response.headers('Total-Count');
            });
        };

        function getTotalFailingCustomChecks() {
            return $http.head(scConfig.service_control_url + '/customchecks?status=fail').then(function (response) {
                return response.headers('Total-Count');
            });
        };

        function getFailingCustomChecks(page) {
            return $http.get(scConfig.service_control_url + '/customchecks?status=fail&page=' + page).then(function (response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        };

        function getFailedMessageStats() {
            return $http.get(scConfig.service_control_url + '/errors/summary').then(function (response) {
                return response.data;
            });
        };
        
        function muteCustomChecks(customCheck) {
            $http.delete(scConfig.service_control_url + '/customchecks/' + customCheck.id)
                .success(function () {
                    notifications.pushForCurrentRoute('"{{item.custom_check_id}}" custom check muted', 'info', { item: customCheck });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Failed to mute "{{item.custom_check_id}}" custom check', 'danger', { item: customCheck });
                });
        };

        function retryAllFailedMessages() {
            $http.post(scConfig.service_control_url + '/errors/retry/all')
                .success(function () {
                   // notifications.pushForCurrentRoute('Retrying all messages...', 'info');
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Retrying all messages failed', 'danger');
                });
        };

        function retryFailedMessages(selectedMessages) {
            $http.post(scConfig.service_control_url + '/errors/retry', selectedMessages)
                .success(function () {
                   // notifications.pushForCurrentRoute('Retrying {{num}} messages...', 'info', { num: selectedMessages.length });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Retrying messages failed', 'danger');
                });
        };

        function archiveFailedMessages(selectedMessages) {
            $http({
                url: scConfig.service_control_url + '/errors/archive',
                data: selectedMessages,
                method: "PATCH",
            })
                .success(function () {
                   // notifications.pushForCurrentRoute('Archiving {{num}} messages...', 'info', { num: selectedMessages.length });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Archiving messages failed', 'danger');
                });
        };

        function archiveExceptionGroup(id, successText) {
            $http.post(scConfig.service_control_url + '/recoverability/groups/' + id + '/errors/archive')
                .success(function () {
                   // notifications.pushForCurrentRoute(successText, 'info');
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Archiving messages failed', 'danger');
                });
        };

        function retryExceptionGroup(id, successText) {
            $http.post(scConfig.service_control_url + '/recoverability/groups/' + id + '/errors/retry')
                .success(function () {
                 //   notifications.pushForCurrentRoute(successText, 'info');
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Retrying messages failed', 'danger');
                });
        };

        function getHeartbeatStats() {
            return $http.get(scConfig.service_control_url + '/heartbeats/stats').then(function (response) {
                return response.data;
            });
        };


        function removeEndpoint(endpoint) {
            $http.delete(scConfig.service_control_url + '/heartbeats/' + endpoint.id)
                .success(function () {
                  //  notifications.pushForCurrentRoute('{{item.originating_endpoint.name}}@{{item.originating_endpoint.machine}} endpoint removed', 'info', { item: endpoint });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Failed to remove {{item.originating_endpoint.name}}@{{item.originating_endpoint.machine}} endpoint', 'danger', { item: endpoint });
                });
        };

        function updateEndpoint(id, data) {
            return $http({
                url: scConfig.service_control_url + '/endpoints/' + id,
                data: data,
                method: "PATCH",
            })
                .success(function () {
                  //  notifications.pushForCurrentRoute('Endpoint updated', 'info');
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Failed to update endpoint', 'danger');
                });
        };

        function getEndpoints() {
            return $http.get(scConfig.service_control_url + '/endpoints').then(function (response) {
                return response.data;
            });
        };

        function getEndpointsWithSla() {
            return this
                .getEndpoints()
                .then(function (endpoints) {
                    var results = [];
                    endpoints.forEach(function (item) {
                        $http.get(scConfig.service_control_url + '/endpoints/' + item.name + '/sla').then(function (response) {
                            angular.extend(item, { sla: response.data.current });
                            results.push(item);
                        });
                    });

                    return results;
                });
        };


        var service = {
            getVersion: getVersion,
            checkLicense: checkLicense,
            getEventLogItems: getEventLogItems,
            getFailedMessages: getFailedMessages,
            getExceptionGroups: getExceptionGroups,
            getFailedMessagesForExceptionGroup: getFailedMessagesForExceptionGroup,
            getMessageBody: getMessageBody,
            getMessageHeaders: getMessageHeaders,
            getTotalFailedMessages: getTotalFailedMessages,
            getTotalFailingCustomChecks: getTotalFailingCustomChecks,
            getFailingCustomChecks: getFailingCustomChecks,
            getFailedMessageStats: getFailedMessageStats,
            muteCustomChecks: muteCustomChecks,
            retryAllFailedMessages: retryAllFailedMessages,
            retryFailedMessages: retryFailedMessages,
            archiveFailedMessages: archiveFailedMessages,
            archiveExceptionGroup: archiveExceptionGroup,
            retryExceptionGroup: retryExceptionGroup,
            getHeartbeatStats: getHeartbeatStats,
            removeEndpoint: removeEndpoint,
            updateEndpoint: updateEndpoint,
            getEndpoints: getEndpoints,
            getEndpointsWithSla: getEndpointsWithSla

        };

        return service;

    }

    Service.$inject = ['$http', 'scConfig', 'notifications'];


    angular.module('services.serviceControlService', [])
        .service('serviceControlService', Service);

} (window, window.angular, window.jQuery));