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

        function loadMessageById (id) {
            return serviceControlService.getFailedMessageById(id)
                .then(function (response) {
                    $scope.message = response.data;

                    //In theory loding body and headers could be done in parallel waiting for both promises.
                    return serviceControlService.getMessageHeaders($scope.message.message_id)
                        .then(function (msg) {
                            $scope.message.messageHeaders = msg.data[0].headers;
                            angular.merge(originalMessageHeaders, $scope.message.messageHeaders);

                            for(var i = 0; i < $scope.message.messageHeaders.length; i++){
                                var header = $scope.message.messageHeaders[i];
                                header.isSensitive = sensitive_headers.includes(header.key);
                                header.isLocked = locked_headers.includes(header.key);
                            }

                            $scope.$watch('message.messageHeaders', function (newVal, oldVal) {
                                for(var i = 0; i < newVal.length; i++){
                                    var newHeader = newVal[i];
                                    var oldHeader = undefined;

                                    for(var j = 0; j < oldVal.length; j++){
                                        if(oldHeader == undefined){
                                            var temp = oldVal[j];
                                            if(temp.key === newHeader.key){
                                                oldHeader = temp;
                                            }
                                        }
                                    }

                                    if(newHeader.value !== oldHeader.value){
                                        newHeader.isChanged = true;
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

        var findHeaderByKey = function(key){
            for(var i = 0; i < $scope.message.messageHeaders.length; i++) {
                if($scope.message.messageHeaders[i].key === key) {
                    return $scope.message.messageHeaders[i];
                }
            }

            return null;
        }

        $scope.markHeaderAsRemoved = function(key){
            var header = findHeaderByKey(key);
            header.isMarkedAsRemoved = true;
        }

        $scope.undoMarkHeaderAsRemoved = function(key){
            var header = findHeaderByKey(key);
            header.isMarkedAsRemoved = false;
        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.retryEditedMessage = function(){

            var headers = [];
            for(var i = 0; i < $scope.message.messageHeaders.length; i++) {
                if(!$scope.message.messageHeaders[i].isMarkedAsRemoved){
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