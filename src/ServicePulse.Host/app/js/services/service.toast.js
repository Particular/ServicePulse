; (function (window, angular, undefined) {
    'use strict';

    function service(toaster) {
        this.showToast = function (text, type, title, sticky) {
            sticky = sticky || false;
            toaster.pop({
                type: type || 'info',
                title: title || 'Message',
                body: text,
                timeout: sticky ? 0 : 5000,
                showCloseButton: sticky
            });
        }

        this.showInfo = function (text) {
            this.showToast(text, 'info', 'Info', false);
        }

        this.showError = function (text) {
            this.showToast(text, 'error', 'Error', true);
        }

        this.showWarning = function (text) {
            this.showToast(text, 'warning', 'Warning', true);
        }
    }

    service.$inject = [
        'toaster'
    ];

    angular.module('sc')
        .service('toastService', service);

} (window, window.angular));