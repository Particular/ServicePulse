; (function (window, angular, undefined) {
    'use strict';

    function ToastService(toaster) {
        this.showToast = function(text, type, title, sticky, onHide) {
            sticky = sticky || false;
            toaster.pop({
                type: type || 'info',
                title: title,
                body: text,
                bodyOutputType: 'trustedHtml',
                timeout: sticky ? 0 : 5000,
                showCloseButton: sticky,
                onHideCallback: onHide
        });
        };

        this.showInfo = function(text, title, sticky, onHide) {
            this.showToast(text, 'info', title || 'Info', sticky, onHide);
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