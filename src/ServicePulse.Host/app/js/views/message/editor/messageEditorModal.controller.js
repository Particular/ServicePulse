; (function (window, angular, undefined) {
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

        function getContentType(headers) {
            var header = headers.find(function (element) { return element.key === 'NServiceBus.ContentType'; });
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

        function loadMessageById(id) {
            return serviceControlService.getFailedMessageById(id)
                .then(function (response) {
                    $scope.message = response.data;

                    //In theory loding body and headers could be done in parallel waiting for both promises.
                    return serviceControlService.getMessageHeaders($scope.message.message_id)
                        .then(function (msg) {
                            $scope.message.messageHeaders = msg.data[0].headers;
                            var intentHeader = findHeaderByKey($scope.message.messageHeaders, 'NServiceBus.MessageIntent');
                            if(intentHeader){
                                $scope.isEvent = intentHeader.value === 'Publish';
                            }
                            originalMessageHeaders = angular.merge(originalMessageHeaders, $scope.message.messageHeaders);

                            for (var i = 0; i < $scope.message.messageHeaders.length; i++) {
                                var header = $scope.message.messageHeaders[i];
                                header.isSensitive = sensitive_headers.includes(header.key);
                                header.isLocked = locked_headers.includes(header.key);
                                header.isMarkedAsRemoved = false;
                                header.isChanged = false;
                            }

                            $scope.$watch('message.messageHeaders', function (newVal, oldVal) {

                                for (var i = 0; i < newVal.length; i++) {
                                    var newHeader = newVal[i];
                                    var oldHeader = undefined;

                                    for (var j = 0; j < oldVal.length; j++) {
                                        if (oldHeader == undefined) {
                                            var temp = oldVal[j];
                                            if (temp.key === newHeader.key) {
                                                oldHeader = temp;
                                            }
                                        }
                                    }

                                    var originalHeader = findHeaderByKey(originalMessageHeaders, newHeader.key);

                                    if (newHeader.value !== oldHeader.value) {
                                        //when newHeader.value === originalHeader.value but the value is changed it's a reset operation
                                        newHeader.isChanged = newHeader.value !== originalHeader.value;
                                        return;
                                    }
                                }
                            }, true);

                            return serviceControlService.getMessageBody($scope.message.message_id)
                                .then(function (msg) {
                                    var bodyContentType = getContentType($scope.message.messageHeaders);
                                    $scope.message.bodyContentType = bodyContentType;
                                    $scope.message.isContentTypeSupported = isContentTypeSupported(bodyContentType);
                                    $scope.message.messageBody = prettifyText(msg.data, bodyContentType);
                                    $scope.message.isBodyChanged = false;
                                    originalMessageBody = $scope.message.messageBody;

                                    $scope.$watch('message.messageBody', function (newBody, oldBody) {
                                        $scope.message.isBodyChanged = newBody !== originalMessageBody;
                                        $scope.message.isBodyEmpty = !newBody || newBody.trim().length === 0;
                                    }, false);

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

        var findHeaderByKey = function (headers, key) {
            for (var i = 0; i < headers.length; i++) {
                if (headers[i].key === key) {
                    return headers[i];
                }
            }

            return null;
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

        $scope.confirmCancellationIfNeeded = function(){

            if($scope.message.isBodyChanged){
                $scope.showCancelConfirmation = true;
                return;
            }

            for (var i = 0; i < $scope.message.messageHeaders.length; i++) {
                var header = $scope.message.messageHeaders[i];
                if(header.isChanged || header.isMarkedAsRemoved){
                    $scope.showCancelConfirmation = true;
                    return;
                }
            }

            $scope.closeDialog();
        };

        $scope.closeDialog = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancelDialogClose = function () {
            $scope.showCancelConfirmation = false;
        };

        $scope.confirmEditAndRetry = function(){
            $scope.showEditAndRetryConfirmation = true;
        };

        $scope.cancelEditRequest = function(){
            $scope.showEditAndRetryConfirmation = false;
        };

        $scope.retryEditedMessage = function () {

            $scope.showEditRetryGenericError = false;

            var headers = [];
            for (var i = 0; i < $scope.message.messageHeaders.length; i++) {
                if (!$scope.message.messageHeaders[i].isMarkedAsRemoved) {
                    headers.push($scope.message.messageHeaders[i]);
                }
            }

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

        loadMessageById(failedMessageId)
            .then(function () {
                $scope.togglePanel($scope.message, 0);
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
