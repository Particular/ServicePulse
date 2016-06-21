;
(function (window, angular, undefined) {
    "use strict";
    
    function controller(
        $scope,
        $uibModalInstance,
        redirectService,
        toastService,
        redirect) {

        $scope.loadingData = false;
        if (redirect) {
            $scope.sourceEndpoint = redirect.sourceEndpoint;
            $scope.targetEndpoint = redirect.targetEndpoint;
            $scope.redirectId = redirect.id;
        } else {
            $scope.sourceEndpoint = '';
            $scope.targetEndpoint = '';
        }
        

        $scope.availableEndpoints = ['queueNameA', 'queueNameB', 'queueNameC', 'queueNameD', 'queueNameE', 'queueNameF'];

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.createRedirect = function (success, failure) {
            if ($scope.redirectId) {
                redirectService.updateRedirect($scope.redirectId, $scope.sourceEndpoint, $scope.targetEndpoint, success, failure).then(function (reason) {
                    toastService.showInfo(reason);
                    $uibModalInstance.close();
                }, function (reason) {
                    toastService.showError(reason);
                });
            } else {
                redirectService.createRedirect($scope.sourceEndpoint, $scope.targetEndpoint, success, failure).then(function (reason) {
                    toastService.showInfo(reason);
                    $uibModalInstance.close();
                }, function(reason) {
                    toastService.showError(reason);
                });
            }
        }

        $scope.invalidData = function() {
            return $scope.redirectForm.queueNameSelect.$invalid ||
                $scope.redirectForm.targetQueue.$invalid;
        };
    }

    controller.$inject = [
        "$scope",
        "$uibModalInstance",
        "redirectService",
        "toastService",
        "redirect"
    ];

    angular.module("sc")
        .controller("editRedirectController", controller);

})(window, window.angular);