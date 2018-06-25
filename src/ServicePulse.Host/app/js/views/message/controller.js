;
(function(window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $routeParams,
        moment,
        $window,
        scConfig,
        toastService,
        serviceControlService,
        archivedMessageService,
        notifyService,
        sharedDataService,
        $filter) {

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

            if (!angular.isDefined(message.messageHeaders)) {
                serviceControlService.getMessageHeaders(message.message_id).then(function (msg) {
                    message.messageHeaders = msg.data[0].headers;
                }, function () {
                    message.headersUnavailable = "message headers unavailable";
                });
            }

            if (angular.isDefined(message.messageHeaders) && !angular.isDefined(message.messageBody)) {
                serviceControlService.getMessageBody(message.message_id).then(function (msg) {
                    var bodyContentType = getContentType(message.messageHeaders);
                    message.messageBody = prettifyText(msg.data, bodyContentType);
                }, function () {
                    message.bodyUnavailable = "message body unavailable";
                });
            }
            
            message.panel = panelnum;
            return false;
        };

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
            return headers.find(function (element) { return element.key === 'NServiceBus.ContentType'; }).value;
        }

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
            toastService.showInfo("Archiving the message " + vm.message.message_id + " ...");
            serviceControlService.archiveFailedMessages([vm.message.id])
                .then(function() {
                    // below line is a way to not fetch for the whole message from SC. We update date to now and calculate delete fields
                    vm.message.last_modified = moment().format();
                    updateMessageDeleteDate(vm.message, vm.error_retention_period);
                    vm.message.archived = true;
                },
                function () {
                    toastService.showError("Archiving the message " + vm.message.message_id + " failed.");
                });
        };

        function updateMessageDeleteDate(message, errorRetentionPeriod) {
            var countdown = moment(message.last_modified).add(errorRetentionPeriod, 'hours');
            message.delete_soon = countdown < moment();
            message.deleted_in = countdown.format();
        }

        vm.unarchiveMessage = function () {
            archivedMessageService.restoreMessageFromArchive(vm.message.id, 'Restore From Archive Request Accepted', 'Restore From Archive Request Rejected')
                .then(function () {
                    vm.message.archived = false;
                },
                function () {
                    toastService.showError("Unarchiving the message " + vm.message.message_id + " failed.");
                });
        };
        
        vm.debugInServiceInsight = function () {
            var messageId = vm.message.message_id;
            var dnsName = scConfig.service_control_url.toLowerCase();

            if (dnsName.indexOf("https") === 0) {
                dnsName = dnsName.replace("https://", "");
            } else {
                dnsName = dnsName.replace("http://", "");
            }

            $window.open("si://" + dnsName + "?search=" + messageId);
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
        'scConfig',
        'toastService',
        'serviceControlService',
        'archivedMessageService',
        'notifyService',
        'sharedDataService',
        '$filter'
    ];

    angular.module("sc")
        .controller("messagesController", controller);

})(window, window.angular);