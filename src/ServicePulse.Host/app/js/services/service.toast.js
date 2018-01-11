; (function (window, angular, undefined) {
    'use strict';

    function service(toaster) {
        this.showToast = function (text, type, title, sticky) {
            sticky = sticky || false;
            toaster.pop({
                type: type || 'info',
                title: title || 'Message',
                body: text,
                bodyOutputType: 'trustedHtml',
                timeout: sticky ? 0 : 5000,
                showCloseButton: sticky
            });
        }

        this.showInfo = function (text, title, sticky) {
            this.showToast(text, 'info', title || 'Info', sticky);
        }

        this.showError = function (text, sticky) {
            if (sticky === undefined) {
                sticky = true;
            } 
            this.showToast(text, 'error', 'Error', sticky);
        }

        this.showWarning = function (text, sticky) {
            if (sticky === undefined) {
                sticky = true;
            } 
            this.showToast(text, 'warning', 'Warning', sticky);
        }
    }

    service.$inject = [
        'toaster'
    ];

    angular.module('sc')
        .service('toastService', service);

} (window, window.angular));