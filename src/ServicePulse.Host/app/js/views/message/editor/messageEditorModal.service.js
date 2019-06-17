; (function (window, angular, undefined) {
    'use strict';

    function service($uibModal) {
        return {
            displayEditMessageModal: function (messageId, editAndRetryConfig) {
                return $uibModal.open({
                    templateUrl: 'js/views/message/editor/messageEditorModal.html',
                    controller: 'messageEditorModalController',
                    backdrop: 'static',
                    resolve: {
                        messageId: function(){
                            return messageId;
                        },
                        editAndRetryConfig: function(){
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