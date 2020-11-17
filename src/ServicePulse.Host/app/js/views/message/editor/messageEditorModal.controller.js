(function (window, angular) {
    'use strict';

    function controller(
        failedMessageId,
        editAndRetryConfig,
        $uibModalInstance,
        $scope,
        serviceControlService,
        moment,
        $filter) {
        var sensitive_headers = editAndRetryConfig.sensitive_headers;
        var locked_headers = editAndRetryConfig.locked_headers;
        var originalMessageBody = '';
        var originalMessageHeaders = [];
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

        function findHeaderByKey(headers, key) {
            return headers.find(function (header) { return header.key === key; });
        }

        function getContentType(headers) {
            var header = findHeaderByKey(headers, 'NServiceBus.ContentType');
            return header ? header.value : null;
        }

        function isContentTypeSupported(contentType) {
            return contentType === 'application/json' || contentType === 'text/xml';
        }

        $scope.isEvent = false;
        $scope.getContentType = getContentType;

        $scope.togglePanel = function (message, panelnum) {
            if (message.notFound || message.error) {
                return false;
            }

            message.panel = panelnum;
            return true;
        };

        var loadMessageBody = function() {
            return serviceControlService.getMessageBody($scope.message)
                .then(function (msg) {
                    var bodyContentType = getContentType($scope.message.messageHeaders);

                    $scope.message.bodyContentType = bodyContentType;
                    $scope.message.isContentTypeSupported = isContentTypeSupported(bodyContentType);
                    $scope.message.messageBody = prettifyText(msg.data, bodyContentType);
                    $scope.message.isBodyChanged = false;
                    originalMessageBody = $scope.message.messageBody;
                }, function () {
                    $scope.message.bodyUnavailable = "message body unavailable";
                });
        }

        var loadMessageHeadersAndMessageBody = function() {
            return serviceControlService.getMessage($scope.message.message_id)
                .then(function (response) {

                    $scope.message.messageHeaders = response.message.headers;
                    $scope.message.bodyUrl = response.message.body_url;
                    var intentHeader = findHeaderByKey($scope.message.messageHeaders, 'NServiceBus.MessageIntent');
                    if (intentHeader) {
                        $scope.isEvent = intentHeader.value === 'Publish';
                    }
                    originalMessageHeaders = angular.merge(originalMessageHeaders, $scope.message.messageHeaders);

                    $scope.message.messageHeaders.forEach(function (header) {
                        header.isSensitive = sensitive_headers.includes(header.key);
                        header.isLocked = locked_headers.includes(header.key);
                        header.isMarkedAsRemoved = false;
                        header.isChanged = false;
                    });

                    return loadMessageBody();

                }, function () {
                    $scope.message.headersUnavailable = "message headers unavailable";
                });
        }

        function loadMessageById(id) {
            return serviceControlService.getFailedMessageById(id)
                .then(function (response) {
                    $scope.message = response.data;
                    return loadMessageHeadersAndMessageBody();
                },
                    function (response) {
                        if (response.status === 404) {
                            $scope.message = { notFound: true };
                        } else {
                            $scope.message = { error: true };
                        }
                    });
        }

        $scope.markHeaderAsRemoved = function (key) {
            var header = findHeaderByKey($scope.message.messageHeaders, key);
            header.isMarkedAsRemoved = true;
        }

        $scope.resetHeaderChanges = function (key) {
            var header = findHeaderByKey($scope.message.messageHeaders, key);
            var originalHeader = findHeaderByKey(originalMessageHeaders, key);
            header.isMarkedAsRemoved = false;
            header.value = originalHeader.value;
        }

        $scope.resetBodyChanges = function () {
            $scope.message.messageBody = originalMessageBody;
        }

        $scope.confirmCancellationIfNeeded = function () {
            $scope.showCancelConfirmation = $scope.message.isBodyChanged || $scope.message.messageHeaders.some(function (header) {
                return header.isChanged || header.isMarkedAsRemoved; }
            );

            if($scope.showCancelConfirmation){
                return;
            }

            $scope.closeDialog();
        };

        $scope.closeDialog = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancelDialogClose = function () {
            $scope.showCancelConfirmation = false;
        };

        $scope.confirmEditAndRetry = function () {
            $scope.showEditAndRetryConfirmation = true;
        };

        $scope.cancelEditRequest = function () {
            $scope.showEditAndRetryConfirmation = false;
        };

        $scope.retryEditedMessage = function () {
            $scope.showEditRetryGenericError = false;

            var headers = $scope.message.messageHeaders.filter(function (header) {
                return !header.isMarkedAsRemoved;
            });

            var editedMessage = {
                message_body: $scope.message.messageBody,
                message_headers: headers,
            };

            return serviceControlService.retryEditedMessage(failedMessageId, editedMessage)
                .then(function () {
                    $uibModalInstance.close('retried');
                }, function(){
                    $scope.showEditAndRetryConfirmation = false;
                    $scope.showEditRetryGenericError = true;
                });
        };

        var discoverChangedHeader = function(newHeaders, oldHeaders) {
            newHeaders.forEach(function (newHeader) {
                var oldHeader = findHeaderByKey(oldHeaders, newHeader.key);

                if (newHeader.value !== oldHeader.value) {
                    //when newHeader.value === originalHeader.value but the value is changed it's a reset operation
                    var originalHeader = findHeaderByKey(originalMessageHeaders, newHeader.key);
                    newHeader.isChanged = newHeader.value !== originalHeader.value;
                    return;
                }
            });
        };

        var unwatchMessageHeaders = function() { };
        var unwatchMessageBody = function() { };

        loadMessageById(failedMessageId)
            .then(function () {
                unwatchMessageHeaders = $scope.$watch('message.messageHeaders', function (newHeaders, oldHeaders) {
                    discoverChangedHeader(newHeaders, oldHeaders)
                }, true);

                unwatchMessageBody = $scope.$watch('message.messageBody', function (newBody, oldBody) {
                    $scope.message.isBodyChanged = newBody !== originalMessageBody;
                    $scope.message.isBodyEmpty = !newBody || newBody.trim().length === 0;
                }, false);

                $scope.togglePanel($scope.message, 0);
            });

        $scope.$on('$destroy', function() {
            unwatchMessageHeaders();
            unwatchMessageBody();
        });
    }

    controller.$inject = [
        'failedMessageId',
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
