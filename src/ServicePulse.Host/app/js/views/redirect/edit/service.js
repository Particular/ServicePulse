; (function (window, angular, undefined) {
    'use strict';
    
    function service($http, $timeout, $q, $uibModal) {
        return {
            displayRedirectModal: function (title, saveButtonText, success, failure, redirect) {
                $uibModal.open({
                    templateUrl: 'js/views/redirect/edit/view.html',
                    controller: 'editRedirectController',
                    resolve: {
                        data: function () {
                            return {
                                redirect: redirect,
                                title: title,
                                saveButtonText: saveButtonText,
                                success: success,
                                failure: failure
                            };
                        }
                    }
                });
            },
            displayCreateRedirectModal: function () {
                this.displayRedirectModal("Create Redirect", "Create", "Redirect was created successfully", "Failed to create the redirect.");
            },
            displayEditRedirectModal: function (redirect) {
                this.displayRedirectModal("Modify Redirect", "Modify", "Redirect was updated successfully", "Failed to update the redirect.", redirect);
            }
        };
    }

    service.$inject = ['$http', '$timeout', '$q', '$uibModal'];

    angular.module('sc')
        .service('redirectModalService', service);

})(window, window.angular);