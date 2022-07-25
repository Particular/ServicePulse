(function (window, angular) {
    'use strict';

    function service($uibModal) {
        return {
            displayEditMessageModal: function (failedMessageId, editAndRetryConfig) {
                return $uibModal.open({
                    templateUrl: 'js/views/message/editor/messageEditorModal.html',
                    controller: 'messageEditorModalController',
                    backdrop: 'static',
                    windowTopClass: 'modal-msg-editor',
                    resolve: {
                        failedMessageId: function() {
                            return failedMessageId;
                        },
                        editAndRetryConfig: function() {
                            return editAndRetryConfig;
                        }
                    }
                });               
            }
        };
    }

    service.$inject = ['$uibModal'];

    angular.module("sc")
        .service("messageEditorModalService", service);

})(window, window.angular);
