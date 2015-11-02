; (function (window, angular, $, undefined) {
    'use strict';


    function Service($http, scConfig, notifications, uri) {

        function getVersion() {
            var url = uri.join(scConfig.service_control_url);
            return $http.get(url).then(function (response) {
                return response.headers('X-Particular-Version');
            });
        };
        
        function checkLicense() {
            var url = uri.join(scConfig.service_control_url);
            return $http.get(url).then(function (response) {
                if (response.data.license_status != "valid") {
                    return false;
                }
                return true;
            });
        };

        function getEventLogItems() {
            var url = uri.join(scConfig.service_control_url, 'eventlogitems');
            return $http.get(url).then(function (response) {
                return response.data;
            });
        };

        function getFailedMessages(sortBy, page) {
            var url = uri.join(scConfig.service_control_url, 'errors?status=unresolved&page=' + page + '&sort=' + sortBy);
            return $http.get(url).then(function (response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        };

        function getExceptionGroups() {
            var url = uri.join(scConfig.service_control_url, 'recoverability','groups');
            return $http.get(url).then(function (response) {
                return {
                    data: response.data
                };
            });
        };

        function getFailedMessagesForExceptionGroup(groupId, sortBy, page) {
            var url = uri.join(scConfig.service_control_url, 'recoverability','groups',groupId,'errors?page=' + page + '&sort=' + sortBy);
            return $http.get(url).then(function (response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        };

        function getMessageBody(messageId) {
            var url = uri.join(scConfig.service_control_url, 'messages',messageId,'body' );
            return $http.get(url).then(function (response) {
                return {
                    data: response.data
                };
            });
        };

        function getMessageHeaders(messageId) {
            var url = uri.join(scConfig.service_control_url, 'messages','search',messageId );
            return $http.get(url).then(function (response) {
                return {
                    data: response.data
                };
            });
        };

        function getTotalFailedMessages() {
            var url = uri.join(scConfig.service_control_url, 'errors?status=unresolved' );
            return $http.get(url).then(function (response) {
                return response.headers('Total-Count');
            });
        };

        function getTotalFailingCustomChecks() {
            var url = uri.join(scConfig.service_control_url, 'customchecks?status=unresolved' );
            return $http.get(url).then(function (response) {
                return response.headers('Total-Count');
            });
        };

        function getFailingCustomChecks(page) {
            var url = uri.join(scConfig.service_control_url, 'customchecks?status=fail&page=' + page );
            return $http.get(url).then(function (response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        };

        function getFailedMessageStats() {
            var url = uri.join(scConfig.service_control_url, 'errors','summary' );
            return $http.get(url).then(function (response) {
                return response.data;
            });
        };
        
        function muteCustomChecks(customCheck) {
            var url = uri.join(scConfig.service_control_url, 'customchecks', customCheck.id);

            $http.delete(url)
            .success(function () {
                notifications.pushForCurrentRoute('"{{item.custom_check_id}}" custom check muted', 'info', { item: customCheck });
            })
            .error(function () {
                notifications.pushForCurrentRoute('Failed to mute "{{item.custom_check_id}}" custom check', 'danger', { item: customCheck });
            });
        };

        function retryAllFailedMessages() {
            var url = uri.join(scConfig.service_control_url, 'errors', 'retry', 'all');
            $http.post(url)
                .success(function () {
                   // notifications.pushForCurrentRoute('Retrying all messages...', 'info');
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Retrying all messages failed', 'danger');
                });
        };

        function retryFailedMessages(selectedMessages) {
            var url = uri.join(scConfig.service_control_url, 'errors', 'retry');
            $http.post(url, selectedMessages)
                .success(function () {
                   // notifications.pushForCurrentRoute('Retrying {{num}} messages...', 'info', { num: selectedMessages.length });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Retrying messages failed', 'danger');
                });
        };

        function archiveFailedMessages(selectedMessages) {
            var url = uri.join(scConfig.service_control_url, 'errors', 'archive');

            $http({
                url: url,
                data: selectedMessages,
                method: 'PATCH'
            })
                .success(function () {
                   // notifications.pushForCurrentRoute('Archiving {{num}} messages...', 'info', { num: selectedMessages.length });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Archiving messages failed', 'danger');
                });
        };

        function archiveExceptionGroup(id, successText) {
            var url = uri.join(scConfig.service_control_url, 'recoverability', 'groups', id, 'errors', 'archive');
            $http.post(url)
                .success(function () {
                   // notifications.pushForCurrentRoute(successText, 'info');
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Archiving messages failed', 'danger');
                });
        };

        function retryExceptionGroup(id, successText) {
           
            var url = uri.join(scConfig.service_control_url, 'recoverability', 'groups', id, 'errors', 'retry');
            $http.post(url)
                .success(function () {
                 //   notifications.pushForCurrentRoute(successText, 'info');
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Retrying messages failed', 'danger');
                });
        };

        function getHeartbeatStats() {
            var url = uri.join(scConfig.service_control_url, 'heartbeats', 'stats');
            return $http.get(url).then(function (response) {
                return response.data;
            });
        };


        function removeEndpoint(endpoint) {
            var url = uri.join(scConfig.service_control_url, 'heartbeats', endpoint.id);
            $http.delete(url)
                .success(function () {
                  //  notifications.pushForCurrentRoute('{{item.originating_endpoint.name}}@{{item.originating_endpoint.machine}} endpoint removed', 'info', { item: endpoint });
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Failed to remove {{item.originating_endpoint.name}}@{{item.originating_endpoint.machine}} endpoint', 'danger', { item: endpoint });
                });
        };

        function updateEndpoint(id, data) {
            var url = uri.join(scConfig.service_control_url, 'endpoints', id);

            return $http({
                url: url,
                data: data,
                method: 'PATCH',
            })
                .success(function () {
                    notifications.pushForCurrentRoute('Endpoint updated', 'info');
                })
                .error(function () {
                    notifications.pushForCurrentRoute('Failed to update endpoint', 'danger');
                });
        };

        function getEndpoints() {
            var url = uri.join(scConfig.service_control_url, 'endpoints');
            return $http.get(url).then(function (response) {
                return response.data;
            });
        };

        function getEndpointsWithSla() {
            return this
                .getEndpoints()
                .then(function (endpoints) {
                    var results = [];
                    endpoints.forEach(function (item) {
                        var url = uri.join(scConfig.service_control_url, 'endpoints', item.name, 'sla');
                        $http.get(url).then(function (response) {
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

    Service.$inject = ['$http', 'scConfig', 'notifications', 'uri'];


    angular.module('services.serviceControlService', [])
        .service('serviceControlService', Service);

} (window, window.angular, window.jQuery));