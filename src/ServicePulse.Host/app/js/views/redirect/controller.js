;
(function (window, angular, undefined) {
    "use strict";
    
    function controller(
        $scope,
        redirectService,
        redirectModalService,
        notifyService) {

        var notifier = notifyService();
        var vm = this;
       
        vm.loadingData = false;
        vm.redirects = [];

        notifier.subscribe($scope, function (event, response) {
            vm.redirects = response.data;
        }, 'RedirectsUpdated');

        function refreshData() {
            redirectService.getRedirects().then(function(redirects) {
                vm.redirects = redirects.data;
            });
        }

        vm.createRedirect = function () {
            redirectModalService.displayCreateRedirectModal();
        };

        vm.editRedirect = function (redirect) {
            redirectModalService.displayEditRedirectModal(redirect);
        };

        vm.deleteRedirect = function (redirect, success, error) {
            redirectService.deleteRedirect(redirect.message_redirect_id, success, error);
        };

        refreshData();
    }

    controller.$inject = [
        "$scope",
        "redirectService",
        "redirectModalService",
        "notifyService"
    ];

    angular.module("sc")
        .controller("redirectController", controller);

})(window, window.angular);