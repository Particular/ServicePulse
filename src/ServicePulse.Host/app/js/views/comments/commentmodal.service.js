(function (window, angular) {
    'use strict';

    function service($uibModal) {
        return {
            displayCommentModal: function (title, saveButtonText, success, failure, comment, group) {
                $uibModal.open({
                    templateUrl: 'js/views/comments/commentmodal.html',
                    controller: 'commentController',
                    resolve: {
                        data: function (){
                            return {
                                comment: comment,
                                group: group,
                                title: title,
                                saveButtonText: saveButtonText,
                                success: success,
                                failure: failure
                            };
                        }
                    }
                });
            },
            displayCreateCommentModal: function (comment, group) {
                this.displayCommentModal('Create Note', 'Create', 'Note was added successfully', 'Failed to create new note.', comment, group);
            },
            displayEditCommentModal: function (comment, group) {
                this.displayCommentModal('Edit Note', 'Modify', 'Note was edited successfully', 'Failed to update the note.', comment, group);
            }
        };
    }

    service.$inject = ['$uibModal'];

    angular.module('sc')
        .service('commentModalService', service);

})(window, window.angular);