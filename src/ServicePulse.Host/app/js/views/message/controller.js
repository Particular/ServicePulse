;
(function(window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $routeParams,
        $moment,
        scConfig,
        toastService,
        serviceControlService,
        archivedMessageService,
        notifyService,
        sharedDataService) {

        var vm = this;
        var notifier = notifyService();

        vm.message = {};

        var init = function () {
            var configuration = sharedDataService.getConfiguration();
            vm.error_retention_period = $moment.duration(configuration.data_retention.error_retention_period).asHours();
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

        vm.togglePanel = function (message, panelnum) {
            if (!angular.isDefined(message.messageBody)) {
                serviceControlService.getMessageBody(message.message_id).then(function (msg) {
                    message.messageBody = msg.data;
                }, function () {
                    message.bodyUnavailable = "message body unavailable";
                });
            }

            if (!angular.isDefined(message.messageHeaders)) {
                serviceControlService.getMessageHeaders(message.message_id).then(function (msg) {
                    message.messageHeaders = msg.data[0].headers;
                }, function () {
                    message.headersUnavailable = "message headers unavailable";
                });
            }
            message.panel = panelnum;
            return false;
        };

        vm.retryMessage = function () {
            serviceControlService.retryFailedMessages([vm.message.id])
                .then(function() {
                        toastService.showInfo("Retrying the message " + vm.message.message_id + " ...");
                        vm.message.retried = true;
                    }
                );
        };

        vm.archiveMessage = function () {
            serviceControlService.archiveFailedMessages([vm.message.id])
                .then(function() {
                    toastService.showInfo("Archiving the message " + vm.message.message_id + " ...");
                    vm.loadMessage(vm.message.id).then(function () { vm.togglePanel(vm.message, 1); });
                    vm.message.archived = true;
                });
        };

        vm.unarchiveMessage = function () {
            archivedMessageService.restoreMessageFromArchive(vm.message.id, 'Restore From Archive Request Accepted', 'Restore From Archive Request Rejected')
                .then(function () {
                    vm.message.archived = false;
                });
        };
        
        //to be deleted
        vm.resolveButtonClicked = function() {
            vm.message.status = "resolved";
            vm.message.resolved = true;
        }

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
                var countdown = $moment(message.last_modified).add(vm.error_retention_period, 'hours');
                message.delete_soon = countdown < $moment();
                message.deleted_in = countdown.format();
                vm.message = message;
            });
        };

        init();
    }

    controller.$inject = [
        "$scope",
        "$routeParams",
        "$moment",
        "scConfig",
        "toastService",
        "serviceControlService",
        "archivedMessageService",
        "notifyService",
        "sharedDataService"
    ];

    angular.module("sc")
        .controller("messagesController", controller);

})(window, window.angular);