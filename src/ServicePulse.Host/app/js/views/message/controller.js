;
(function(window, angular, undefined) {
    "use strict";

    function controller(
        $scope,
        $routeParams,
        scConfig,
        toastService,
        serviceControlService,
        archivedMessageService,
        notifyService) {

        var vm = this;
        var notifier = notifyService();

        vm.message = {};

        var init = function() {
            var messageId = $routeParams.messageId;
            vm.loadMessage(messageId);
        };

        notifier.subscribe($scope, function (event, messageFailureResolved) {
            if (messageFailureResolved.failed_message_id === vm.message.message_id) {
                toastService.showInfo('Message was successfully retried.');
                vm.message.retried = false;
            }
        }, "MessageFailureResolved");

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
                    vm.message.archived = true;
                });
        };

        vm.unarchiveMessage = function () {
            archivedMessageService.restoreMessageFromArchive(vm.message.id, 'Restore From Archive Request Accepted', 'Restore From Archive Request Rejected')
                .then(function () {
                    vm.message.archived = false;
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
            serviceControlService.getFailedMessageById(messageId).then(function (response) {
                vm.message = response.data;
            });
        };

        init();
    }

    controller.$inject = [
        "$scope",
        "$routeParams",
        "scConfig",
        "toastService",
        "serviceControlService",
        "archivedMessageService",
        "notifyService"
    ];

    angular.module("sc")
        .controller("messagesController", controller);

})(window, window.angular);