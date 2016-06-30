;
(function (window, angular, undefined) {
    "use strict";
    
    function controller(
        $scope,
        $timeout,
        $interval,
        $location,
        $uibModal,
        redirectService) {

        var vm = this;
       
        vm.loadingData = false;
        vm.redirects = [];

        function refreshData() {
            redirectService.getRedirects().then(function(result) {
                vm.redirects = result.data;
            });
        }

        displayEditModal = function (title, redirect) {
            $uibModal.open({
                templateUrl: 'js/views/redirect/edit/view.html',
                controller: 'editRedirectController',
                resolve: {
                    data: function () {
                        return {
                            redirect: redirect,
                            title: title
                        };
                    }
                }
            }).result.then(function (selectedItem) {
                refreshData();
            });
        };

        vm.createRedirect = function () {
            displayEditModal("Create Redirect");
        };

        vm.editRedirect = function (redirect) {
            displayEditModal("Modify Redirect", redirect);
        };

        vm.deleteRedirect = function (id, success, error) {
            redirectService.deleteRedirect(id, success, error);
            refreshData();
        };
        refreshData();
    }

    controller.$inject = [
        "$scope",
        "$timeout",
        "$interval",
        "$location",
        "$uibModal",
        "redirectService"
    ];

    angular.module("sc")
        .controller("redirectController", controller);

})(window, window.angular);