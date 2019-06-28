; (function (window, angular, undefined) {
    'use strict';

    function controller(
        messageId,
        editAndRetryConfig,
        $uibModalInstance,
        $scope,
        serviceControlService,
        moment,
        $filter) {
        var sensitive_headers = editAndRetryConfig.sensitive_headers;
        var locked_headers = editAndRetryConfig.locked_headers;
        var originalMessageBody = '';
        var originalMessageHeaders = {};
        $scope.message = undefined;

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

        function isContentTypeSupported(contentType) {
            if (contentType === 'application/json' || contentType === 'text/xml') {
                return true;
            }

            return false;
        }
        
        $scope.getContentType = getContentType;

        $scope.togglePanel = function (message, panelnum) {
            if (message.notFound || message.error)
                return false;
            
            message.panel = panelnum;
            return true;
        };

        $scope.isBodyChanged = function(){
            return $scope.message.messageBody !== originalMessageBody;
        }

        $scope.isHeaderChanged = function(key){
            return $scope.message.messageHeaders[key] !== originalMessageHeaders[key];
        }

        $scope.isHeaderLocked = function(key){
            return locked_headers.includes(key);
        }

        $scope.isHeaderSensitive = function(key){
            return sensitive_headers.includes(key);
        }

        function loadMessageById (id) {
            return serviceControlService.getFailedMessageById(id)
                .then(function (response) {
                    $scope.message = response.data;

                    //In theory loding body and headers could be done in parallel waiting for both promises.
                    return serviceControlService.getMessageHeaders($scope.message.message_id)
                        .then(function (msg) {
                            $scope.message.messageHeaders = msg.data[0].headers;
                            angular.merge(originalMessageHeaders, $scope.message.messageHeaders);

                            return serviceControlService.getMessageBody($scope.message.message_id)
                                .then(function (msg) {
                                    var bodyContentType = getContentType($scope.message.messageHeaders);
                                    $scope.message.bodyContentType = bodyContentType;
                                    $scope.message.isContentTypeSupported = isContentTypeSupported(bodyContentType);
                                    $scope.message.messageBody = prettifyText(msg.data, bodyContentType);
                                    angular.merge(originalMessageBody, $scope.message.messageBody);
                                }, function () {
                                    message.bodyUnavailable = "message body unavailable";
                            });
                        }, function () {
                            $scope.message.headersUnavailable = "message headers unavailable";
                        });
                },
                function (response) {
                    if (response.status === 404) {
                        $scope.message = { notFound: true };
                    } else {
                        $scope.message = { error: true };
                    }
                });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.retryEditedMessage = function(){
            var editedMessage = {
                message_body: $scope.message.messageBody,
                message_headers: $scope.message.messageHeaders,
            };

            return serviceControlService.retryEditedMessage(messageId, editedMessage)
                .then(function () {
                    $uibModalInstance.close('retried');
                });
        };

        loadMessageById(messageId)
            .then(function () { 
                $scope.togglePanel($scope.message, 0); 
            });
    }

    controller.$inject = [
        'messageId',
        'editAndRetryConfig',
        '$uibModalInstance',
        '$scope',
        'serviceControlService',
        'moment',
        '$filter',
    ];

    angular.module("sc")
        .controller("messageEditorModalController", controller);

})(window, window.angular);