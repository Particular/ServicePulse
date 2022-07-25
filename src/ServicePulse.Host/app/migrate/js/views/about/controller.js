(function (window, angular) {
    "use strict";

    function controller(
        $scope,
        sharedDataService,
        notifyService) {

        var vm = this;
        var notifier = notifyService();
        var environment = sharedDataService.getenvironment();

        vm.sp_version = environment.sp_version;
        vm.sc_version = environment.sc_version;
        vm.is_compatible_with_sc = environment.is_compatible_with_sc;
        vm.minimum_supported_sc_version = environment.minimum_supported_sc_version;

        notifier.subscribe($scope, function (event, data) {
            vm.sc_version = data.sc_version;
            vm.is_compatible_with_sc = data.is_compatible_with_sc;
        }, "EnvironmentUpdated");

    }

    controller.$inject = [
        "$scope",
        "sharedDataService",
        "notifyService"
    ];

    angular.module("sc")
        .controller("aboutController", controller);

})(window, window.angular);