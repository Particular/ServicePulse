; (function (window, angular, undefined) {
    'use strict';
    
    function service($http, $timeout, $q, $uibModal) {
        

        return {
            displayRedirectModal: function (title, saveButtonText, success, failure, refreshData, redirect) {
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
                }).result.then(function () {
                    if (angular.isFunction(refreshData)) {
                        refreshData();
                    }
                });
            },
            displayCreateRedirectModal: function (refreshData) {
                this.displayRedirectModal("Create Redirect", "Create", "Redirect was created successfully", "Failed to create the redirect.", refreshData);
            },
            displayEditRedirectModal: function (redirect, refreshData) {
                this.displayRedirectModal("Modify Redirect", "Modify", "Redirect was updated successfully", "Failed to update the redirect.", refreshData, redirect);
            }
        };
    }

    service.$inject = ['$http', '$timeout', '$q', '$uibModal'];

    angular.module('sc')
        .service('redirectModalService', service);

})(window, window.angular);