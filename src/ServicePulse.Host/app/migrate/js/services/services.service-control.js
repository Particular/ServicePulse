(function(window, angular, $) {
    'use strict';

    function Service($http, connectionsManager, notifications, uri) {

        var scu = connectionsManager.getServiceControlUrl();

        function getServiceControlMetadata() {
            var url = uri.join(scu);
            return $http.get(url).then(function(response) {
                return {
                    version: response.headers('X-Particular-Version'),
                    archivedGroupsUrl: response.data.archived_groups_url
                };
            });
        }

        function checkLicense() {
            var url = uri.join(scu);
            return $http.get(url).then(function(response) {
                if (response.data.license_status !== 'valid') {
                    return false;
                }
                return true;
            });
        }

        function getEventLogItems() {
            var url = uri.join(scu, 'eventlogitems');
            return $http.get(url).then(function(response) {
                return response.data;
            });
        }

        function getFailedMessages(sortBy, page, direction) {
            var url = uri.join(scu, 'errors?status=unresolved&page=' + page + '&sort=' + sortBy + '&direction=' + direction);
            return $http.get(url).then(function(response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        }

        var previousExceptionGroupEtag;

        function getExceptionGroups(classifier, classifierFilter) {
            var url = uri.join(scu, 'recoverability', 'groups', classifier) + '?classifierFilter=' + classifierFilter;
            return $http.get(url).then(function (response) {
                var status = 200;
                if (previousExceptionGroupEtag === response.headers('etag')) {
                    status = 304;
                } else {
                    previousExceptionGroupEtag = response.headers('etag');
                }
                return {
                    data: response.data,
                    status: status
                };
            });
        }

        function getExceptionGroup(groupId) {
            var url = uri.join(scu, 'recoverability', 'groups', 'id', groupId);
            return $http.get(url).then(function (response) {
                var status = 200;
                if (previousExceptionGroupEtag === response.headers('etag')) {
                    status = 304;
                } else {
                    previousExceptionGroupEtag = response.headers('etag');
                }
                return {
                    data: response.data,
                    status: status
                };
            });
        }

        function getExceptionGroupsForLogicalEndpoint(endpointName) {
            return getExceptionGroups('Endpoint Name', endpointName);
        }

        function getExceptionGroupsForEndpointInstance(endpointName) {
            return getExceptionGroups('Endpoint Instance', endpointName);
        }

        function getHistoricGroups() {
            var url = uri.join(scu, 'recoverability', 'history');
            return $http.get(url).then(function (response) {
                return {
                    data: response.data,
                    etag: response.headers('etag')
                };
            });
        }

        function getFailedMessageById(messageId) {
            var url = uri.join(scu, 'errors', 'last', messageId);
            return $http.get(url);
        }

        function getEditAndRetryConfig() {
            var url = uri.join(scu,'edit', 'config');
            return $http.get(url).then(function(response) {
                return response.data;
            }, function(response) {
                if (response.status === 404) {
                    return {
                        enabled: false
                    };
                }

                return response;
            });
        }

        function retryEditedMessage(messageId, editedMessage) {
            return $http({
                url: uri.join(scu, 'edit', messageId),
                method: 'POST',
                data: editedMessage,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function getFailedMessagesForExceptionGroup(groupId, sortBy, page) {
            var url = uri.join(scu, 'recoverability', 'groups', groupId, 'errors?page=' + page + '&sort=' + sortBy + '&status=unresolved');
            return $http.get(url).then(function(response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        }

        function getMessageBody(message) {
            var url = uri.join(scu, 'messages', message.message_id, 'body');
            if(message.bodyUrl) {
                url = uri.join(scu, message.bodyUrl);
            }

            return $http({
                url: url,
                method: 'GET',
                transformResponse: function(defaults, transform) {
                    // Remove any comments from the body before deserializing
                    return JSON.parse(defaults.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, function (m, g) { return g ? "" : m }));
                }
              });
        }

        function getMessage(messageId) {
            var url = uri.join(scu, 'messages', 'search', messageId);
            return $http.get(url).then(function(response) {
                var matchingMessage = response.data.find(function(m) { return m.message_id === messageId; });
                return {
                    message: matchingMessage
                };
            });
        }

        function getTotalFailedMessages() {
            var url = uri.join(scu, 'errors?status=unresolved');
            return $http.head(url).then(function(response) {
                return response.headers('Total-Count');
            });
        }

        function getTotalArchivedMessages() {
            var url = uri.join(scu, 'errors?status=archived');
            return $http.head(url).then(function(response) {
                return response.headers('Total-Count');
            });
        }

        function getExceptionGroupClassifiers() {
            var url = uri.join(scu, 'recoverability', 'classifiers');
            return $http.get(url).then(function (response) {
                return response.data;
            });
        }

        function getConfiguration() {
            var url = uri.join(scu, 'configuration');
            return $http.get(url).then(function(response) {
                return response.data;
            });
        }

        function getTotalFailingCustomChecks() {
            var url = uri.join(scu, 'customchecks?status=fail');
            return $http.get(url).then(function(response) {
                return response.headers('Total-Count');
            });
        }

        function getTotalPendingRetries() {
            var url = uri.join(scu, 'errors?status=retryissued');
            return $http.head(url).then(function(response) {
                return response.headers('Total-Count');
            });
        }

        function getFailingCustomChecks(page) {
            var url = uri.join(scu, 'customchecks?status=fail&page=' + page);
            return $http.get(url).then(function(response) {
                return {
                    data: response.data,
                    total: response.headers('Total-Count')
                };
            });
        }

        function getFailedMessageStats() {
            var url = uri.join(scu, 'errors', 'summary');
            return $http.get(url).then(function(response) {
                return response.data;
            });
        }

        function dismissCustomChecks(customCheck) {
            var url = uri.join(scu, 'customchecks', customCheck.id);

            $http.delete(url);
        }

        function retryPendingMessagesForQueue(queueName) {
            var url = uri.join(scu, 'errors', 'queues', queueName, 'retry');
            $http.post(url)
                .then(function() {
                    notifications.pushForCurrentRoute('Retrying all pending retry messages for queue ' + queueName, 'info');
                }, function() {
                    notifications.pushForCurrentRoute('Retrying all pending retried messages for queue ' + queueName + ' failed', 'danger');
                });
        }

        function retryAllFailedMessages() {
            var url = uri.join(scu, 'errors', 'retry', 'all');
            return $http.post(url)
                .then(function() {
                    notifications.pushForCurrentRoute('Retrying all messages...', 'info');
                }, function() {
                    notifications.pushForCurrentRoute('Retrying all messages failed', 'danger');
                });
        }

        function retryFailedMessages(selectedMessages) {
            var url = uri.join(scu, 'errors', 'retry');
            return $http.post(url, selectedMessages)
                .then(function() {
                    notifications.pushForCurrentRoute('Retrying {{num}} messages...', 'info', { num: selectedMessages.length });
                }, function() {
                    notifications.pushForCurrentRoute('Retrying messages failed', 'danger');
                });
        }

        function archiveFailedMessages(selectedMessages) {
            var url = uri.join(scu, 'errors', 'archive');

            return $http({
                    url: url,
                    data: selectedMessages,
                    method: 'PATCH'
                })
                .then(function() {
                    notifications.pushForCurrentRoute('Deleting {{num}} messages...', 'info', { num: selectedMessages.length });
                }, function() {
                    notifications.pushForCurrentRoute('Messages delete operation failed', 'danger');
                });
        }

        function archiveExceptionGroup(id, successText) {
            var url = uri.join(scu, 'recoverability', 'groups', id, 'errors', 'archive');
            return $http.post(url)
                .then(null, function() {
                    notifications.pushForCurrentRoute('Messages delete operation failed', 'danger');
                });
        }

        function acknowledgeArchiveGroup(groupId) {
            var url = uri.join(scu, 'recoverability', 'unacknowledgedgroups', groupId);
            return $http.delete(url).then(null, function () {
                notifications.pushForCurrentRoute('Messages delete operation failed', 'danger');
            });
        }

        function deleteComment(groupId){
            var url = uri.join(scu, 'recoverability', 'groups', groupId, 'comment');
            return $http.delete(url)
                .then(null, function() {
                    notifications.pushForCurrentRoute('Deleted comment for a group ' + groupId, 'info');
                });
        }

        function editComment(groupId, comment){
            var url = uri.join(scu, 'recoverability', 'groups', groupId, 'comment?comment=' + comment);
            return $http.post(url)
                .then(null, function() {
                    notifications.pushForCurrentRoute('Editted comment for group ' + groupId, 'info');
                });
        }

        function acknowledgeGroup(id, successText, failureText) {
            var url = uri.join(scu, 'recoverability', 'unacknowledgedgroups', id);
            return $http.delete(url).then(null, function () {
                    notifications.pushForCurrentRoute('Retrying messages failed', 'danger');
                });
        }

        function retryExceptionGroup(id, successText) {

            var url = uri.join(scu, 'recoverability', 'groups', id, 'errors', 'retry');
            return $http.post(url)
                .then(null, function() {
                    notifications.pushForCurrentRoute('Retrying messages failed', 'danger');
                });
        }

        function getHeartbeatStats() {
            var url = uri.join(scu, 'heartbeats', 'stats');
            return $http.get(url).then(function (response) {
                return response.data;
            });
        }


        function loadQueueNames() {
            var url = uri.join(scu, 'errors', 'queues', 'addresses');

            return $http.get(url);
        }
        
        function getConversation(conversationId) {
            var url = uri.join(scu, 'conversations', conversationId);
            return $http.get(url).then(function (response) {
                return response.data;
            });
        }
        

        var service = {
            getServiceControlMetadata: getServiceControlMetadata,
            checkLicense: checkLicense,
            getConfiguration: getConfiguration,
            getEventLogItems: getEventLogItems,
            getFailedMessages: getFailedMessages,
            getExceptionGroup: getExceptionGroup,
            getExceptionGroups: getExceptionGroups,
            getExceptionGroupsForLogicalEndpoint: getExceptionGroupsForLogicalEndpoint,
            getExceptionGroupsForEndpointInstance: getExceptionGroupsForEndpointInstance,
            getExceptionGroupClassifiers: getExceptionGroupClassifiers,
            getHistoricGroups: getHistoricGroups,
            getFailedMessagesForExceptionGroup: getFailedMessagesForExceptionGroup,
            getMessageBody: getMessageBody,
            getMessage: getMessage,
            getTotalFailedMessages: getTotalFailedMessages,
            getTotalArchivedMessages: getTotalArchivedMessages,
            getTotalFailingCustomChecks: getTotalFailingCustomChecks,
            getTotalPendingRetries: getTotalPendingRetries,
            getFailingCustomChecks: getFailingCustomChecks,
            getFailedMessageStats: getFailedMessageStats,
            dismissCustomChecks: dismissCustomChecks,
            retryAllFailedMessages: retryAllFailedMessages,
            retryPendingMessagesForQueue: retryPendingMessagesForQueue,
            retryFailedMessages: retryFailedMessages,
            archiveFailedMessages: archiveFailedMessages,
            archiveExceptionGroup: archiveExceptionGroup,
            acknowledgeArchiveGroup: acknowledgeArchiveGroup,
            editComment: editComment,
            deleteComment: deleteComment,
            retryExceptionGroup: retryExceptionGroup,
            getHeartbeatStats: getHeartbeatStats,
            loadQueueNames: loadQueueNames,
            acknowledgeGroup: acknowledgeGroup,
            getFailedMessageById: getFailedMessageById,
            getEditAndRetryConfig: getEditAndRetryConfig,
            retryEditedMessage : retryEditedMessage,
            getConversation: getConversation
        };

        return service;
    }

    Service.$inject = ['$http', 'connectionsManager', 'notifications', 'uri'];

    angular.module('services.serviceControlService', [])
        .service('serviceControlService', Service);
}(window, window.angular, window.jQuery));
