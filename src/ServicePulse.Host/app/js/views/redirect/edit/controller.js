;
(function (window, angular, undefined) {
    "use strict";
    
    function controller(
        $scope,
        $uibModalInstance,
        redirectService,
        toastService,
        data) {

        $scope.loadingData = false;
        if (data.redirect) {
            $scope.sourceEndpoint = data.redirect.sourceEndpoint;
            $scope.targetEndpoint = data.redirect.targetEndpoint;
            $scope.redirectId = data.redirect.id;
        } else {
            $scope.sourceEndpoint = '';
            $scope.targetEndpoint = '';
        }
        $scope.title = data.title;

        $scope.availableEndpoints = ['queueNameA', 'queueNameB', 'queueNameC', 'queueNameD', 'queueNameE', 'queueNameF'];

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.createRedirect = function (success, failure) {
            if ($scope.redirectId) {
                redirectService.updateRedirect($scope.redirectId, $scope.sourceEndpoint, $scope.targetEndpoint, success, failure).then(function (reason) {
                    toastService.showInfo(success + ":" + reason);
                    $uibModalInstance.close();
                }, function (reason, status) {
                    if (status === '409' || status === 409) {
                        toastService.showError('Failed to create a redirect, can not create more than one redirect for queue:' + $scope.sourceEndpoint);
                    } else {
                        toastService.showError(failure + ":" + reason);
                    }
                    
                });
            } else {
                redirectService.createRedirect($scope.sourceEndpoint, $scope.targetEndpoint, success, failure).then(function (reason) {
                    toastService.showInfo(success + ":" + reason);
                    $uibModalInstance.close();
                }, function (reason, status) {
                    if (status === '409' || status === 409) {
                        toastService.showError('Failed to create a redirect, can not create more than one redirect for queue:' + $scope.sourceEndpoint);
                    } else {
                        toastService.showError(failure + ":" + reason);
                    }
                });
            }
        }
    }

    controller.$inject = [
        "$scope",
        "$uibModalInstance",
        "redirectService",
        "toastService",
        "data"
    ];

    angular.module("sc")
        .controller("editRedirectController", controller);

})(window, window.angular);