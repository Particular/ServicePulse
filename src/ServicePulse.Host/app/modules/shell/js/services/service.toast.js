; (function (window, angular, undefined) {
    'use strict';

    function ToastService(toaster) {
        this.showToast = function(text, type, title, sticky) {
            sticky = sticky || false;
            toaster.pop({
                type: type || 'info',
                title: title,
                body: text,
                bodyOutputType: 'trustedHtml',
                timeout: sticky ? 0 : 5000,
                showCloseButton: sticky
            });
        };

        this.showInfo = function(text, title, sticky) {
            this.showToast(text, 'info', title || 'Info', sticky);
        };

        this.showError = function(text, sticky) {
            if (sticky === undefined) {
                sticky = true;
            }
            this.showToast(text, 'error', 'Error', sticky);
        };

        this.showWarning = function(text, sticky, showTitle = true) {
            if (sticky === undefined) {
                sticky = true;
            }
            this.showToast(text, 'warning', showTitle ? 'Warning' : '', sticky);
        };
    }

    ToastService.$inject = [
        'toaster'
    ];

    angular.module('toastService', ['toaster'])
        .service('toastService', ToastService);

} (window, window.angular));