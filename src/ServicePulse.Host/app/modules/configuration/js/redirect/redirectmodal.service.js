(function (window, angular) {
    'use strict';

    function service($uibModal) {
        return {
            displayRedirectModal: function (title, saveButtonText, success, failure, redirect, queueAddress) {
                const template = require('../../views/redirectmodal.html');

                $uibModal.open({
                    template: template,
                    controller: 'editRedirectController',
                    resolve: {
                        data: () => {
                            return {
                                redirect: redirect,
                                queueAddress: queueAddress,
                                title: title,
                                saveButtonText: saveButtonText,
                                success: success,
                                failure: failure
                            };
                        }
                    }
                });
            },
            displayCreateRedirectModal: function (queueAddress) {
                this.displayRedirectModal('Create Redirect', 'Create', 'Redirect was created successfully', 'Failed to create the redirect.', null, queueAddress);
            },
            displayEditRedirectModal: function (redirect) {
                this.displayRedirectModal('Modify Redirect', 'Modify', 'Redirect was updated successfully', 'Failed to update the redirect.', redirect);
            }
        };
    }

    service.$inject = ['$uibModal'];

    angular.module('configuration.redirect')
        .service('redirectModalService', service);

})(window, window.angular);