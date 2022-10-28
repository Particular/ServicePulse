(function(window, angular) {
    "use strict";

    function controller(
        $scope,
        $routeParams,
        moment,
        $window,
        connectionsManager,
        toastService,
        serviceControlService,
        archivedMessageService,
        notifyService,
        sharedDataService,
        $filter,
        messageEditorModalService,
        editAndRetryConfig,
        exportToFile) {

        var vm = this;
        var notifier = notifyService();

        vm.message = {};

        var init = function () {
            var configuration = sharedDataService.getConfiguration();
            vm.error_retention_period = moment.duration(configuration.data_retention.error_retention_period).asHours();
            var messageId = $routeParams.messageId;
            vm.loadMessage(messageId).then(function () { vm.togglePanel(vm.message, 1); });
        };

        notifier.subscribe($scope, function (event, messageFailureResolved) {
            if (messageFailureResolved.failed_message_id === vm.message.id) {
                toastService.showInfo('Message was successfully retried.');
                vm.message.retried = false;
                vm.message.resolved = true;
            }
        }, "MessageFailureResolvedByRetry");

        notifier.subscribe($scope, function (event, messageFailureResolved) {
            if (messageFailureResolved.failed_message_id === vm.message.id) {
                toastService.showInfo('Message failed.');
                vm.message.retried = false;
            }
        }, "MessageFailed");

        vm.clipComplete = function(messageId) {
            toastService.showInfo(messageId + ' copied to clipboard');
        };

        vm.goBack = function () {
            $window.history.go(-1);
        };

        vm.togglePanel = function (message, panelnum) {
            if (message.notFound || message.error)
                return false;

            downloadHeadersAndBody(message);

            message.panel = panelnum;
            return false;
        };

        function downloadHeadersAndBody(message) {
            if (!angular.isDefined(message.headers)) {
                return serviceControlService.getMessage(message.message_id).then(function (response) {
                    message.headers = response.message.headers;
                    message.conversationId = message.headers.find(function(x){return x.key === 'NServiceBus.ConversationId';}).value;
                }, function () {
                    message.headersUnavailable = "message headers unavailable";
                });
            }

            if (angular.isDefined(message.headers) && !angular.isDefined(message.messageBody)) {
                return serviceControlService.getMessageBody(message).then(function (msg) {
                    var bodyContentType = getContentType(message.headers);
                    message.messageBody = prettifyText(msg.data, bodyContentType);
                }, function () {
                    message.bodyUnavailable = "message body unavailable";
                });
            }
        }

        function prettifyText(text, contentType) {
            if (contentType === 'application/json') {
                return $filter('json')(text);
            }
            if (contentType === 'text/xml') {
                return $filter('prettyXml')(text);
            }
            return text;
        }

        function getContentType(headers) {
            var header = headers.find(function (element) { return element.key === 'NServiceBus.ContentType'; });
            return header ? header.value : null;
        }

        vm.getContentType = getContentType;

        vm.retryMessage = function () {
            toastService.showInfo("Retrying the message " + vm.message.message_id + " ...");
            serviceControlService.retryFailedMessages([vm.message.id])
                .then(function() {
                        vm.message.retried = true;
                },
                    function() {
                        toastService.showError("Retrying the message " + vm.message.message_id + " failed.");
                    }
                );
        };

        vm.archiveMessage = function () {
            toastService.showInfo("Deleting the message " + vm.message.message_id + " ...");
            serviceControlService.archiveFailedMessages([vm.message.id])
                .then(function() {
                    // below line is a way to not fetch for the whole message from SC. We update date to now and calculate delete fields
                    vm.message.last_modified = moment().format();
                    updateMessageDeleteDate(vm.message, vm.error_retention_period);
                    vm.message.archived = true;
                },
                function () {
                    toastService.showError("Deleting the message " + vm.message.message_id + " failed.");
                });
        };

        vm.isEditAndRetryEnabled = editAndRetryConfig.enabled;

        vm.editMessage = function() {
            if(!editAndRetryConfig.enabled){
                throw 'Edit & Retry is disabled.';
            }
            var failedMessageId = vm.message.id;
            var modalInstance = messageEditorModalService.displayEditMessageModal(failedMessageId, editAndRetryConfig);
            modalInstance.result.then(function(result) {
                //closed
            }, function(reason){
                //dismissed
            });
        };

        vm.exportMessage = function () {
            if (!angular.isDefined(vm.message.messageBody)) {
                downloadHeadersAndBody(vm.message).then(function() {
                    prepareAndSaveExportFile(vm.message);                });
            } else {
                prepareAndSaveExportFile(vm.message);
            }
        };

        function prepareAndSaveExportFile(message) {
            var txtStr = "STACKTRACE\n";
            txtStr += message.exception.stack_trace;

            txtStr += "\n\nHEADERS";
            for (var i = 0; i < message.headers.length; i++) {
                txtStr += '\n' + message.headers[i].key + ': ' + message.headers[i].value;
            }

            txtStr += "\n\nMESSAGE BODY\n";
            txtStr += message.messageBody;

            exportToFile.downloadString(txtStr, "text/txt", "failedMessage.txt");

            toastService.showInfo("Message export completed.");
        }

        function updateMessageDeleteDate(message, errorRetentionPeriod) {
            var countdown = moment(message.last_modified).add(errorRetentionPeriod, 'hours');
            message.delete_soon = countdown < moment();
            message.deleted_in = countdown.format();
        }

        vm.unarchiveMessage = function () {
            archivedMessageService.restoreMessageFromArchive(vm.message.id, 'Request to restore message accepted', 'Request to restore message rejected')
                .then(function () {
                    vm.message.archived = false;
                },
                function () {
                    toastService.showError("Restoring the message " + vm.message.message_id + " failed.");
                });
        };

        vm.debugInServiceInsight = function () {
            var messageId = vm.message.message_id;
            var endpointName = vm.message.receiving_endpoint.name;
            var dnsName = connectionsManager.getServiceControlUrl().toLowerCase();

            if (dnsName.indexOf("https") === 0) {
                dnsName = dnsName.replace("https://", "");
            } else {
                dnsName = dnsName.replace("http://", "");
            }

            $window.open("si://" + dnsName + "?search=" + messageId + "&endpointname=" + endpointName);
        };

        vm.loadMessage = function (messageId) {
            return serviceControlService.getFailedMessageById(messageId).then(function (response) {
                var message = response.data;
                message.archived = message.status === 'archived';
                message.resolved = message.status === 'resolved';
                message.retried = message.status === 'retryIssued';
                updateMessageDeleteDate(message, vm.error_retention_period);
                vm.message = message;
            },
                function (response) {
                    if (response.status === 404) {
                        vm.message = { notFound: true };
                    } else {
                        vm.message = { error: true };
                    }
                });
        };

        init();
    }

    controller.$inject = [
        '$scope',
        '$routeParams',
        'moment',
        '$window',
        'connectionsManager',
        'toastService',
        'serviceControlService',
        'archivedMessageService',
        'notifyService',
        'sharedDataService',
        '$filter',
        'messageEditorModalService',
        'editAndRetryConfig',
        'exportToFile'
    ];

    angular.module("sc")
        .controller("messagesController", controller);

})(window, window.angular);
