;
(function (window, angular, undefined) {
    "use strict";
    
    function controller(
        $scope,
        $timeout,
        $interval,
        $location,
        $uibModal,
        redirectService,
        notifyService) {

        var notifier = notifyService();
        var vm = this;
       
        vm.loadingData = false;
        vm.redirects = [];

        function refreshData() {
            redirectService.getRedirects().then(function(result) {
                vm.redirects = result.data;
            });
        }

        vm.createRedirect = function () {
            redirectService.displayCreateRedirectModal();
        };

        vm.editRedirect = function (redirect) {
            redirectService.displayEditRedirectModal(redirect);
        };

        vm.deleteRedirect = function (redirect, success, error) {
            redirectService.deleteRedirect(redirect.message_redirect_id, success, error);
            var indexToRemove = vm.redirects.indexOf(redirect);
            vm.redirects.splice(indexToRemove, 1);
            notifier.notify('RedirectMessageCountUpdated', vm.redirects.length);
        };

        notifier.subscribe($scope, refreshData, 'RedirectMessageCountUpdated');

        refreshData();
    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$interval",
        "$location",
        "$uibModal",
        "redirectService",
        "notifyService"
    ];

    angular.module("sc")
        .controller("redirectController", controller);

})(window, window.angular);