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

        function displayEditModal(title, saveButtonText, success, failure, redirect) {
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
                refreshData();
            });
        };

        vm.createRedirect = function () {
            displayEditModal("Create Redirect", "Create", "Redirect was created successfully", "Failed to create redirect.");
        };

        vm.editRedirect = function (redirect) {
            displayEditModal("Modify Redirect", "Modify", "Redirect was updated successfully", "Failed to update redirect.", redirect);
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