; (function (window, angular, undefined) {
    'use strict';

    function service(toaster) {
        this.showToast = function (text, type, title) {
            toaster.pop({
                type: type || 'info',
                title: title || 'Message',
                body: text,
                showCloseButton: true
            });
        }
    }

    service.$inject = [
        'toaster'
    ];

    angular.module('sc')
        .service('toastService', service);

} (window, window.angular));