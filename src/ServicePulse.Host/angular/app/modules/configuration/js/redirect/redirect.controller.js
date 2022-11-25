(function (window, angular) {
    'use strict';

    function controller(
        $scope,
        redirectService,
        redirectModalService,
        notifyService) {
        var notifier = notifyService();
        var vm = this;
       
        vm.loadingData = false;
        vm.redirects = [];

        notifier.subscribe($scope, (event, response) => {
            vm.redirects = response.data;
        }, 'RedirectsUpdated');

        function refreshData() {
            redirectService.getRedirects().then((redirects) => {
                vm.redirects = redirects.data;
            });
        }

        vm.createRedirect = () => redirectModalService.displayCreateRedirectModal();
        vm.editRedirect = (redirect) => redirectModalService.displayEditRedirectModal(redirect);
        vm.deleteRedirect = (redirect, success, error) => redirectService.deleteRedirect(redirect.message_redirect_id, success, error);

        refreshData();
    }

    controller.$inject = [
        '$scope',
        'redirectService',
        'redirectModalService',
        'notifyService'
    ];

    angular.module('configuration.redirect')
        .controller('redirectController', controller);

})(window, window.angular);